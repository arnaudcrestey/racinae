"use client";
import React from "react";
import { useDrag } from "react-dnd";

type ToolDraggableProps = {
  toolType: string;
  label: string;
  icon: React.ReactNode;
};

export default function ToolDraggable({ toolType, label, icon }: ToolDraggableProps) {
  const [{ isDragging }, drag] = useDrag({
    type: "SPECIAL_TOOL",
    item: { toolType },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag as any}
      className={`flex flex-col items-center cursor-grab select-none ${isDragging ? "opacity-50" : ""}`}
      title={`Glisse sur un bloc pour ${label.toLowerCase()}`}
      style={{ opacity: isDragging ? 0.4 : 1 }}
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-xs text-gray-500 font-semibold">{label}</span>
    </div>
  );
}
