import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useStytch } from "@stytch/nextjs";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Message } from "@/lib/types";
import { useRouter } from "next/navigation";

type NavbarProps = {
  isConnected: boolean;
  isReadonly: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
};

export const Navbar = ({
  isConnected,
  isReadonly,
  setMessages,
}: NavbarProps) => {
  const stytch = useStytch();
  const [isDeleting, setIsDeleting] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const { push } = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete("/api/chat");
      toast.success("Chat deleted successfully");
      setOpenDeleteModal(false);
      window.location.reload();
    } catch (_) {
      toast.error("Failed to delete chat");
    }
    setIsDeleting(false);
  };

  return (
    <>
      <div className="border-b shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-muted animate-pulse border shadow-sm" />
          <div className="flex items-center gap-2">
            <span className="font-medium">TheraChat</span>
            <span className="relative flex size-3">
              <span
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                  isConnected ? "bg-green-400" : "bg-red-400"
                )}
              ></span>
              <span
                className={cn(
                  "relative inline-flex size-3 rounded-full",
                  isConnected ? "bg-green-500" : "bg-red-500"
                )}
              ></span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="md:py-2 md:px-4 p-3"
            variant="destructive"
            disabled={isReadonly || isDeleting}
            onClick={() => setOpenDeleteModal(true)}
          >
            <span className="md:inline-block hidden">Delete Chat</span>
            <TrashIcon className="size-4" />
          </Button>
          <Button
            onClick={async () => {
              try {
                await stytch.session.revoke();
                toast.success("Logged out successfully");
                push("/");
              } catch (_) {
                toast.error("Failed to log out");
              }
            }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the chat? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
