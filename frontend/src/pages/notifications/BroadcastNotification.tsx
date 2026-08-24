import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth";
import { useBroadcastNotification } from "@/hooks/useNotifications";
import { useUsers } from "@/hooks/useUsers";
import { Send, Smartphone, Mail, BellRing, Users, UserPlus, FileText, Loader2, Plus, Trash2 } from "lucide-react";

const broadcastSchema = z.object({
  modes: z.array(z.string()).min(1, "Select at least one delivery mode"),
  targetAudience: z.string(),
  userIds: z.array(z.string()).optional(),
  externalContacts: z.array(z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })).optional(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
});

type BroadcastFormValues = z.infer<typeof broadcastSchema>;

export function BroadcastNotification() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === "ADMIN";
  const broadcastMutation = useBroadcastNotification();

  // Fetch users for "Selected Users"
  const { data: usersData, isLoading: usersLoading } = useUsers({ limit: 1000 });
  const allUsers = usersData?.items || usersData?.data?.items || [];

  const defaultAudience = isAdmin ? "ALL_USERS" : "MY_CLIENTS";

  const form = useForm<BroadcastFormValues>({
    resolver: zodResolver(broadcastSchema),
    defaultValues: {
      modes: ["IN_APP"],
      targetAudience: defaultAudience,
      userIds: [],
      externalContacts: [{ name: "", email: "", phone: "" }],
      title: "",
      message: "",
    },
  });

  const { fields: externalFields, append, remove } = useFieldArray({
    control: form.control,
    name: "externalContacts",
  });

  const watchModes = form.watch("modes");
  const watchAudience = form.watch("targetAudience");
  const watchTitle = form.watch("title");
  const watchMessage = form.watch("message");
  const watchUserIds = form.watch("userIds") || [];

  // Sync Audience Options
  const audienceOptions = isAdmin 
    ? [
        { id: "ALL_USERS", label: "All Users", desc: "Broadcast to everyone on the platform" },
        { id: "SELECTED_USERS", label: "Selected Users", desc: "Pick specific registered users" },
        { id: "EXTERNAL_USERS", label: "External Contacts (Guests)", desc: "Send via SMS/Email to non-registered contacts" },
      ]
    : [
        { id: "MY_CLIENTS", label: "My Clients", desc: "Broadcast to patients associated with your profile" },
      ];

  // Prevent IN_APP mode if EXTERNAL_USERS is selected
  useEffect(() => {
    if (watchAudience === "EXTERNAL_USERS" && watchModes.includes("IN_APP")) {
      form.setValue("modes", watchModes.filter(m => m !== "IN_APP"));
    }
  }, [watchAudience, watchModes, form]);

  const toggleMode = (mode: string) => {
    const current = new Set(form.getValues("modes"));
    if (current.has(mode)) {
      current.delete(mode);
    } else {
      current.add(mode);
    }
    form.setValue("modes", Array.from(current));
  };

  const toggleUser = (userId: string) => {
    const current = new Set(form.getValues("userIds"));
    if (current.has(userId)) {
      current.delete(userId);
    } else {
      current.add(userId);
    }
    form.setValue("userIds", Array.from(current));
  };

  const onSubmit = (data: BroadcastFormValues) => {
    broadcastMutation.mutate(data as any, {
      onSuccess: () => {
        form.reset({
          modes: ["IN_APP"],
          targetAudience: defaultAudience,
          userIds: [],
          externalContacts: [{ name: "", email: "", phone: "" }],
          title: "",
          message: "",
        });
      }
    });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in max-w-[1200px] mx-auto pb-24">
      <div>
        <h1 className="font-serif text-3xl font-bold text-[var(--color-forest)]">Advanced Broadcast System</h1>
        <p className="text-muted-foreground mt-1">
          Send smart multi-channel notifications to users and external contacts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COMPOSER FORM */}
        <div className="lg:col-span-2 space-y-6">
          <form id="broadcast-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* DELIVERY MODES */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Delivery Modes</CardTitle>
                <CardDescription>Select the channels to dispatch this notification through.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div 
                    onClick={() => watchAudience !== "EXTERNAL_USERS" && toggleMode("IN_APP")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      watchAudience === "EXTERNAL_USERS" 
                        ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-100"
                        : watchModes.includes("IN_APP") 
                          ? "border-[var(--color-lime)] bg-[var(--color-lime)]/5" 
                          : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${watchModes.includes("IN_APP") && watchAudience !== "EXTERNAL_USERS" ? "bg-[var(--color-lime)] text-[var(--color-forest)]" : "bg-slate-100 text-slate-500"}`}>
                      <BellRing className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">In-App</h4>
                      <p className="text-xs text-slate-500">Platform notification</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleMode("EMAIL")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      watchModes.includes("EMAIL") 
                        ? "border-[var(--color-lime)] bg-[var(--color-lime)]/5" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${watchModes.includes("EMAIL") ? "bg-[var(--color-lime)] text-[var(--color-forest)]" : "bg-slate-100 text-slate-500"}`}>
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Email</h4>
                      <p className="text-xs text-slate-500">Direct inbox message</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => toggleMode("SMS")}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      watchModes.includes("SMS") 
                        ? "border-[var(--color-lime)] bg-[var(--color-lime)]/5" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${watchModes.includes("SMS") ? "bg-[var(--color-lime)] text-[var(--color-forest)]" : "bg-slate-100 text-slate-500"}`}>
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">SMS</h4>
                      <p className="text-xs text-slate-500">Direct text message</p>
                    </div>
                  </div>
                </div>
                {form.formState.errors.modes && <p className="text-sm text-red-500 mt-2">{form.formState.errors.modes.message}</p>}
              </CardContent>
            </Card>

            {/* AUDIENCE */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Target Audience</CardTitle>
                <CardDescription>Who should receive this notification?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup 
                  value={watchAudience} 
                  onValueChange={(val) => {
                    form.setValue("targetAudience", val);
                    form.setValue("userIds", []);
                  }} 
                  className="grid grid-cols-1 gap-3"
                >
                  {audienceOptions.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-3 space-y-0 rounded-lg border p-4">
                      <RadioGroupItem value={opt.id} id={`audience-${opt.id}`} />
                      <Label htmlFor={`audience-${opt.id}`} className="flex flex-col cursor-pointer flex-1">
                        <span className="font-semibold text-sm">{opt.label}</span>
                        <span className="text-xs text-slate-500 font-normal">{opt.desc}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* DYNAMIC FIELD: SELECTED USERS */}
                {watchAudience === "SELECTED_USERS" && (
                  <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
                    <Label>Select Users</Label>
                    {usersLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    ) : (
                      <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                        {allUsers.map((u: any) => (
                          <div key={u._id} className="flex items-center space-x-3 bg-white p-2 rounded border shadow-sm">
                            <Checkbox 
                              id={`user-${u._id}`} 
                              checked={watchUserIds.includes(u._id)}
                              onCheckedChange={() => toggleUser(u._id)}
                            />
                            <Label htmlFor={`user-${u._id}`} className="flex flex-col cursor-pointer flex-1">
                              <span className="text-sm font-medium">{u.firstName} {u.lastName}</span>
                              <span className="text-xs text-slate-500">{u.email}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* DYNAMIC FIELD: EXTERNAL USERS */}
                {watchAudience === "EXTERNAL_USERS" && (
                  <div className="p-4 border rounded-lg bg-slate-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Guest Contacts</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => append({ name: "", email: "", phone: "" })}>
                        <Plus className="h-4 w-4 mr-2" /> Add Contact
                      </Button>
                    </div>
                    {externalFields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start bg-white p-3 rounded border shadow-sm relative group">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                          <Input placeholder="Name (optional)" {...form.register(`externalContacts.${index}.name`)} className="h-9 text-sm" />
                          <Input placeholder="Email Address" type="email" {...form.register(`externalContacts.${index}.email`)} className="h-9 text-sm" />
                          <Input placeholder="Phone Number" {...form.register(`externalContacts.${index}.phone`)} className="h-9 text-sm" />
                        </div>
                        {externalFields.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => remove(index)}
                            className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* COMPOSER */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Message Contents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Notification Title</Label>
                  <Input 
                    placeholder="e.g., Important Platform Update" 
                    {...form.register("title")} 
                    className="font-medium"
                  />
                  {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Message Body</Label>
                  <Textarea 
                    placeholder="Type your message here..." 
                    {...form.register("message")} 
                    className="min-h-[150px] resize-y leading-relaxed"
                  />
                  {form.formState.errors.message && <p className="text-xs text-red-500">{form.formState.errors.message.message}</p>}
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* LIVE PREVIEW (STICKY) */}
        <div className="space-y-6 hidden lg:block">
          <div className="sticky top-[100px]">
            <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Live Preview
            </h3>
            
            <div className="bg-slate-100 rounded-[2rem] p-4 border-[8px] border-slate-200 shadow-xl h-[500px] relative overflow-hidden">
              {/* Dynamic status bar */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium px-2 mb-6">
                <span>9:41</span>
                <div className="flex gap-1">
                  <span>LTE</span>
                  <span>100%</span>
                </div>
              </div>

              {watchTitle || watchMessage ? (
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50 animate-in slide-in-from-top-4 fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-5 w-5 bg-[var(--color-forest)] rounded flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">C</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CareBis Prime</span>
                    <span className="text-[10px] text-slate-400 ml-auto">Just now</span>
                  </div>
                  <h4 className="font-semibold text-sm text-slate-900 leading-tight mb-1">
                    {watchTitle || "Notification Title"}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                    {watchMessage || "Your message preview will appear here..."}
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 pb-20">
                  <FileText className="h-12 w-12 mb-4" />
                  <p className="text-sm font-medium">Start typing to preview</p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              form="broadcast-form" 
              disabled={broadcastMutation.isPending}
              className="w-full mt-6 h-12 text-md font-semibold bg-[var(--color-forest)] hover:bg-[var(--color-forest)]/90 shadow-lg shadow-green-900/20"
            >
              {broadcastMutation.isPending ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              Dispatch Broadcast
            </Button>
            
          </div>
        </div>

      </div>
    </div>
  );
}
