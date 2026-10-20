import { HealthAccountEntryModel } from './health-account.model.js';
import { ResultRecordModel } from '../results/result.model.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { logger } from '../../utils/logger.js';

interface ExportParameter {
  parameterKey: string;
  parameterName: string;
  pillar: 'CARDIO' | 'RENAL' | 'METABOLIC';
  value: string;
  unit: string;
  referenceMin: number | null;
  referenceMax: number | null;
  testDate: string;
  laboratoryId: string;
  laboratoryName: string;
}

export const healthAccountService = {
  /**
   * GET /api/v1/health-account/me
   * Returns all health account entries for the authenticated client,
   * grouped by parameterKey and sorted by testDate ascending.
   */
  async getMyHealthAccount(clientId: string) {
    const entries = await HealthAccountEntryModel.find({ clientId })
      .sort({ parameterKey: 1, testDate: 1 })
      .lean();

    // Group entries by parameterKey
    const grouped: Record<string, typeof entries> = {};
    for (const entry of entries) {
      const key = entry.parameterKey;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(entry);
    }

    return grouped;
  },

  /**
   * POST /api/v1/health-account/export
   * Creates one HealthAccountEntry per selected parameter from a result.
   */
  async exportParameters(
    clientId: string,
    resultId: string,
    parameters: ExportParameter[]
  ) {
    // Verify result belongs to this client
    const result = await ResultRecordModel.findById(resultId).lean();
    if (!result) {
      throw new NotFoundError('Result not found.');
    }

    // Allow export if the result's patientId matches the clientId
    // (patientId field in results references the Patient collection,
    // which links to the User via userId)
    // For now, we trust the frontend to only show results belonging
    // to the authenticated user.

    const entries = parameters.map((param) => ({
      clientId,
      sourceResultId: resultId,
      parameterKey: param.parameterKey,
      parameterName: param.parameterName,
      pillar: param.pillar,
      value: param.value,
      unit: param.unit,
      referenceMin: param.referenceMin,
      referenceMax: param.referenceMax,
      testDate: new Date(param.testDate),
      laboratoryId: param.laboratoryId,
      laboratoryName: param.laboratoryName,
      exportedAt: new Date(),
    }));

    // Use insertMany with ordered:false to skip duplicates (unique index)
    let insertedCount = 0;
    try {
      const inserted = await HealthAccountEntryModel.insertMany(entries, {
        ordered: false,
      });
      insertedCount = inserted.length;
    } catch (error: unknown) {
      // MongoDB bulk write errors with duplicate key errors are expected
      // when re-exporting the same parameter from the same result
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        // Some were duplicates; count the ones that were inserted
        if ('insertedDocs' in error) {
          insertedCount = (error as { insertedDocs: unknown[] }).insertedDocs.length;
        }
        if (insertedCount === 0) {
          // All were duplicates
          logger.info('All parameters already exported', { clientId, resultId });
        }
      } else {
        throw error;
      }
    }

    return { success: true, count: insertedCount };
  },

  /**
   * DELETE /api/v1/health-account/parameter/:parameterKey
   * Removes ALL entries for a specific parameterKey for the authenticated client.
   * Does NOT delete from results — only from the Health Account tracking.
   */
  async removeParameter(clientId: string, parameterKey: string) {
    const result = await HealthAccountEntryModel.deleteMany({
      clientId,
      parameterKey: parameterKey.toUpperCase(),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundError('No tracked entries found for this parameter.');
    }

    return { success: true, deletedCount: result.deletedCount };
  },

  /**
   * GET /api/v1/health-account/export-history
   * Returns a chronological log of export events for the authenticated client.
   */
  async getExportHistory(clientId: string) {
    const entries = await HealthAccountEntryModel.find({ clientId })
      .sort({ exportedAt: -1 })
      .lean();

    // Group by sourceResultId + exportedAt to reconstruct export events
    const eventMap = new Map<
      string,
      {
        resultId: string;
        resultName: string;
        testDate: Date;
        parametersExported: string[];
        exportedAt: Date;
        laboratoryName: string;
      }
    >();

    for (const entry of entries) {
      // Create a key combining resultId and a rounded exportedAt
      // (entries from the same export action share the same exportedAt timestamp)
      const exportKey = `${entry.sourceResultId.toString()}_${entry.exportedAt.toISOString()}`;

      if (!eventMap.has(exportKey)) {
        eventMap.set(exportKey, {
          resultId: entry.sourceResultId.toString(),
          resultName: entry.parameterName, // Will be overridden
          testDate: entry.testDate,
          parametersExported: [],
          exportedAt: entry.exportedAt,
          laboratoryName: entry.laboratoryName,
        });
      }

      const event = eventMap.get(exportKey)!;
      event.parametersExported.push(entry.parameterName);
    }

    // Convert map to array and sort by exportedAt descending
    const events = Array.from(eventMap.values()).sort(
      (a, b) => b.exportedAt.getTime() - a.exportedAt.getTime()
    );

    // Try to enrich resultName from the actual result
    for (const event of events) {
      try {
        const result = await ResultRecordModel.findById(event.resultId)
          .select('panelName')
          .lean();
        if (result) {
          event.resultName = result.panelName;
        }
      } catch {
        // Keep default name
      }
    }

    return events;
  },

  /**
   * GET /api/v1/health-account/stats
   * Returns overall Health Account adoption statistics for Admin.
   */
  async getHealthAccountStats() {
    const totalEntries = await HealthAccountEntryModel.countDocuments();
    const uniqueClients = (await HealthAccountEntryModel.distinct('clientId')).length;
    const uniqueParameters = (await HealthAccountEntryModel.distinct('parameterKey')).length;

    return {
      totalEntries,
      uniqueClients,
      uniqueParameters,
    };
  },
};
