import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-center space-x-4 cxs:space-x-8 csm:space-x-16 items-center gap-4">
      <Link href="/upload" className="font-bold">Upload</Link>
      <Link href="/display" className="font-bold">Display</Link>
      <Link href="/delete" className="font-bold">Delete</Link>
    </nav>
  );
}
