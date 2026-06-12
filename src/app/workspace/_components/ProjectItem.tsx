"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Edit3, MoreVertical, Trash2 } from "lucide-react";
import axios from "axios";
import Link from "next/link";

type ProjectItemProps = {
  project: any;
  GetProjectList: () => void;
};

const ProjectItem = ({ project, GetProjectList }: ProjectItemProps) => {
  const chatMessage = project?.chats?.[0]?.chatMessage;
  let title = "Untitled Project";

  if (Array.isArray(chatMessage) && chatMessage[0]?.content) {
    title = chatMessage[0].content;
  } else if (typeof chatMessage === "string") {
    title = chatMessage;
  }

  const [openDialog, setOpenDialog] = useState(false);
  const [newName, setNewName] = useState(title);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const handleRename = async () => {
    if (!newName.trim()) return;
    await axios.post("/api/rename-project", {
      projectId: project.projectId,
      newName,
    });
    setOpenDialog(false);
    GetProjectList(); // refresh after rename
  };

  const handleDelete = async () => {
    try {
      await axios.post("/api/delete-project", {
        projectId: project.projectId,
      });
      setOpenDeleteDialog(false);
      GetProjectList();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  return (
    <div
      key={project.projectId}
      className="py-1 px-2 rounded-lg cursor-pointer hover:bg-gray-300 hover:border-black hover:shadow-lg flex items-center justify-between"
    >
      {/* Project Link */}
      <Link
        href={`/playground/${project.projectId}?frameId=${project.frameId}`}
        className="flex-1 line-clamp-1"
      >
        {title}
      </Link>

      {/* Popover Menu */}
      <Popover>
        <PopoverTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-gray-200 rounded-full"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className="w-40 p-2 bg-white border border-gray-200 shadow-md rounded-xl cursor-pointer"
        >
          <button
            className="flex items-center gap-2 w-full p-2 text-sm text-gray-800 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => setOpenDialog(true)}
          >
            <Edit3 className="w-4 h-4" />
            Rename
          </button>

          <button
            className="flex items-center gap-2 w-full p-2 text-sm text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
            onClick={() => setOpenDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </PopoverContent>
      </Popover>

      {/* Rename Dialog */}
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rename Project</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a new name for this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border p-2 rounded-md w-full"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRename}>Rename</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectItem;
