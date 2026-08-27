import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../api/services/categories';

export function useCategories(appliesTo?: string) {
  return useQuery({
    queryKey: ['categories', appliesTo],
    queryFn: () => categoryService.getActiveCategories(appliesTo),
  });
}

export function useAllCategories() {
  return useQuery({
    queryKey: ['categories', 'admin'],
    queryFn: categoryService.getAllCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
