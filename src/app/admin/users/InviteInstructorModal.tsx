"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Copy, Check } from "lucide-react";

interface InviteInstructorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InviteInstructorModal({ isOpen, onClose, onSuccess }: InviteInstructorModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/invite-instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setTempPassword(data.tempPassword);
        toast.success("Instructor account created!");
        onSuccess(); // Refresh the table behind the modal
      } else {
        toast.error(data.error || "Failed to invite instructor");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Password copied to clipboard");
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setFormData({ firstName: "", lastName: "", email: "" });
    setTempPassword(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Invite Instructor</h3>
          <button onClick={handleClose} className="p-1 rounded-md text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!tempPassword ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-md border-0 py-2 px-3 text-sm ring-1 ring-inset ring-border bg-background focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-md border-0 py-2 px-3 text-sm ring-1 ring-inset ring-border bg-background focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border-0 py-2 px-3 text-sm ring-1 ring-inset ring-border bg-background focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Inviting..." : "Send Invite"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-foreground mb-2">Instructor Created!</h4>
              <p className="text-sm text-muted-foreground mb-6">
                The account has been created. Please securely share this temporary password with the instructor. They can change it after logging in.
              </p>
              
              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-border mb-6">
                <code className="flex-1 font-mono text-lg tracking-wider text-foreground">{tempPassword}</code>
                <button 
                  onClick={copyToClipboard}
                  className="p-2 rounded-md hover:bg-background border border-transparent hover:border-border transition-colors text-muted-foreground"
                  title="Copy password"
                >
                  {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <button 
                onClick={handleClose}
                className="w-full px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md shadow-sm hover:bg-primary/90 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
