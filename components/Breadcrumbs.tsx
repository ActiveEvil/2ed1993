// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";

// export const Breadcrumbs: React.FC<{
//   crumbs:
// }> = ({}): React.JSX.Element => {
//   const pathname = usePathname();
//   const crumbs = pathname.split("/").filter(Boolean);
//   return (
//     <div className="flex gap-2 w-full max-w-5xl">
//       {crumbs.length ? (
//         <>
//           <Link
//             className="font-subtitle text-lg hover:underline underline-offset-4"
//             href="/"
//           >
//             2ed1993
//           </Link>
//           {crumbs.map((crumb) => {
//             console.log(crumb);
//             return (
//               <>
//                 &gt;
//                 <Link
//                   className="font-subtitle text-lg hover:underline underline-offset-4"
//                   href=
//                 >
//                   2ed1993
//                 </Link>
//               </>
//             );
//           })}
//         </>
//       ) : (
//         <span className="font-subtitle text-lg">2ed1993</span>
//       )}
//     </div>
//   );
// };
