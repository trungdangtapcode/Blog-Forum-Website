import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Linkedin,
  Share2,
  Twitter,
  Copy,
  Mail,
  MessageCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

interface SharingBoxProps {
  postId: string;
  postTitle: string;
  triggerButton?: React.ReactNode;
}

const SharingBox: React.FC<SharingBoxProps> = ({
  postId,
  postTitle,
  triggerButton,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const postUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/posts/${postId}`
      : `/posts/${postId}`;

  const shareText = encodeURIComponent(`Check out this post: ${postTitle}`);
  const shareUrl = encodeURIComponent(postUrl);

  const shareOptions = [
    {
      name: "X / Twitter",
      icon: <Twitter className="h-5 w-5" />,
      color: "bg-black hover:bg-gray-800",
      textColor: "text-white",
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`,
          "_blank"
        );
      },
    },
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      color: "bg-[#1877F2] hover:bg-[#166fe5]",
      textColor: "text-white",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
          "_blank"
        );
      },
    },
    {
      name: "LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      color: "bg-[#0A66C2] hover:bg-[#095bb1]",
      textColor: "text-white",
      onClick: () => {
        window.open(
          `https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareText}`,
          "_blank"
        );
      },
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="h-5 w-5" />,
      color: "bg-[#25D366] hover:bg-[#21c35e]",
      textColor: "text-white",
      onClick: () => {
        window.open(
          `https://wa.me/?text=${shareText}%20${shareUrl}`,
          "_blank"
        );
      },
    },
    {
      name: "Email",
      icon: <Mail className="h-5 w-5" />,
      color: "bg-gray-600 hover:bg-gray-700",
      textColor: "text-white",
      onClick: () => {
        window.open(
          `mailto:?subject=${shareText}&body=${shareText}%0A%0A${shareUrl}`,
          "_blank"
        );
      },
    },
  ];

  const copyToClipboard = () => {
    if (!postUrl) {
      toast.error("No URL to copy");
      console.error("postUrl is undefined or empty");
      return;
    }

    if (!navigator.clipboard) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = postUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success("Link copied to clipboard", {
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      } catch (err) {
        toast.error("Could not copy link");
        console.error("Fallback copy failed: ", err);
      }
      document.body.removeChild(textArea);
      return;
    }

    navigator.clipboard.writeText(postUrl).then(
      () => {
        toast.success("Link copied to clipboard", {
          style: {
            background: "#333",
            color: "#fff",
          },
        });
      },
      (err) => {
        toast.error("Could not copy link");
        console.error("Could not copy text: ", err);
      }
    );
  };

  // Animation variants for share buttons
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Staggered animation
        type: "spring",
        stiffness: 120,
      },
    }),
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Button
              variant="outline"
              size="icon"
              className="transition-all bg-gradient-to-r from-primary-700 to-secondary-700 text-white border-none hover:from-primary-600 hover:to-secondary-600 shadow-md hover:shadow-lg"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Share2 className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 text-white border-none">
                  <p>Share this post</p>
                </TooltipContent>
              </Tooltip>
            </Button>
          </motion.div>
        )}
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent
            className="sm:max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl justify-center px-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Share this post
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                  Share this post with your friends and colleagues
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 py-6">
                {shareOptions.map((option, index) => (
                  <motion.div
                    key={option.name}
                    custom={index}
                    initial="hidden"
                    animate="visible"
                    variants={buttonVariants}
                  >
                    <Button
                      className={`flex flex-col items-center justify-center ${option.color} ${option.textColor} p-4 h-auto rounded-lg shadow-md hover:shadow-lg transition-all`}
                      onClick={() => {
                        option.onClick();
                        setIsOpen(false);
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {option.icon}
                      </motion.div>
                      <span className="mt-2 text-xs font-medium">
                        {option.name}
                      </span>
                    </Button>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center space-x-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                <span className="truncate text-sm text-gray-900 dark:text-white flex-1">
                  {postUrl}
                </span>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default SharingBox;