import {  User, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-4 md:py-2 md:px-6 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-xl shadow-black/5 z-10 relative">
      {/* Left: Hamburger button (visible on mobile only) */}
      <div className="md:hidden w-10" /> {/* Placeholder to balance centering */}

      {/* Center: Title on all screens */}
      <h1 className="text-3xl md:text-3xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center flex-1 font-['Dancing_Script']">
        Radius Manager
      </h1>

      {/* Right: User Profile Dropdown */}
      <div className="w-10">
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none cursor-pointer">
            <Avatar className="h-10 w-10 border-2 border-white shadow-md hover:shadow-lg transition-shadow">
              <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
              <AvatarFallback className="bg-blue-100 text-blue-600 font-bold">U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-xl border-gray-200">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs leading-none text-muted-foreground">admin@radius.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-100" />
            <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50 hover:text-red-700 focus:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}