// "use client";

import TodayTaskComponent from "@/components/task/todayTask/page";

// import { useState } from "react";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
//   useDraggable,
// } from "@dnd-kit/core";
// import {
//   arrayMove,
//   SortableContext,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import { CSS } from "@dnd-kit/utilities";

// type Item = { id: string; content: string };

// const initialData: Record<string, Item[]> = {
//   pending: [
//     { id: "1", content: "Task 1" },
//     { id: "2", content: "Task 2" },
//   ],
//   inProgress: [{ id: "3", content: "Task 3" }],
//   completed: [{ id: "4", content: "Task 4" }],
// };

// function SortableItem({ item }: { item: Item }) {
//   const { attributes, listeners, setNodeRef, transform } =
//     useDraggable({ id: item.id });

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     padding: "1rem",
//     margin: "0.5rem 0",
//     backgroundColor: "#0f172a",
//     borderRadius: "0.5rem",
//     cursor: "grab",
//   };

//   return (
//     <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
//       {item.content}
//     </div>
//   );
// }

// export default function MultiContainerBoard() {
//   const [columns, setColumns] = useState(initialData);

//   const sensors = useSensors(useSensor(PointerSensor));

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over) return;

//     const fromColumn = Object.keys(columns).find((col) =>
//       columns[col].some((item) => item.id === active.id)
//     );
//     const toColumn = Object.keys(columns).find((col) =>
//       columns[col].some((item) => item.id === over.id)
//     );

//     if (!fromColumn || !toColumn) return;

//     if (fromColumn === toColumn) {
//       // Reorder in the same column
//       const oldIndex = columns[fromColumn].findIndex(
//         (item) => item.id === active.id
//       );
//       const newIndex = columns[toColumn].findIndex(
//         (item) => item.id === over.id
//       );
//       const newItems = arrayMove(columns[fromColumn], oldIndex, newIndex);
//       setColumns({ ...columns, [fromColumn]: newItems });
//     } else {
//       // Move between columns
//       const activeItem = columns[fromColumn].find((item) => item.id === active.id)!;
//       const newFrom = columns[fromColumn].filter((item) => item.id !== active.id);
//       const newTo = [...columns[toColumn], activeItem];
//       setColumns({ ...columns, [fromColumn]: newFrom, [toColumn]: newTo });
//     }
//   };

//   return (
//     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
//       <div style={{ display: "flex", gap: "1rem" }}>
//         {Object.entries(columns).map(([colId, items]) => (
//           <div
//             key={colId}
//             style={{
//               flex: 1,
//               padding: "1rem",
//               backgroundColor: "gray",
//               borderRadius: "0.5rem",
//               minHeight: "200px",
//             }}
//           >
//             <h3 style={{ textTransform: "capitalize", marginBottom: "0.5rem" }}>
//               {colId.replace(/([A-Z])/g, " $1")}
//             </h3>
//             <SortableContext items={items} strategy={verticalListSortingStrategy}>
//               {items.map((item) => (
//                 <SortableItem key={item.id} item={item} />
//               ))}
//             </SortableContext>
//           </div>
//         ))}
//       </div>
//     </DndContext>
//   );
// }

export default function TaskView(){
  return <TodayTaskComponent />
}