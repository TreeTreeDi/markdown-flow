"use client";

import { memo } from "react";
import { MessageItem, type MessageItemProps } from "streaming-markdown-react";
import { cn } from "@/lib/utils";

type ResponseProps = MessageItemProps;

export const Response = memo(
  ({ className, ...props }: ResponseProps) => (
    <MessageItem
      className={cn(
        "size-full [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:whitespace-pre-wrap [&_code]:break-words [&_pre]:max-w-full [&_pre]:overflow-x-auto",
        className
      )}
      {...props}
    />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Response.displayName = "Response";
