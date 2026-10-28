import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-sm text-slate-500 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} ZipCode Tools. Vận hành trên Cloudflare Edge & D1.</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/countries" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            Quốc Gia
          </Link>
          <a
            href="https://download.geonames.org/export/zip/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Nguồn Dữ Liệu GeoNames
          </a>
          <a
            href="http://mabuuchinh.vn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Mã Bưu Chính VN
          </a>
        </div>
      </div>
    </footer>
  );
}
