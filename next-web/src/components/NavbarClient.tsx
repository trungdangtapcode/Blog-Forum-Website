"use client"

import { NAVBAR_HEIGHT } from '@/lib/constants'
import Link from 'next/link'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { Button } from './ui/button'


import { Bell, MessageCircle, Home, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NotificationsList } from "./ui/NotificationsList";
import { MessagesList } from "./ui/MessagesList";
import { getUnreadNotificationsCount } from "@/utils/notificationsApi";
import { getUnreadMessagesCount } from "@/utils/messagesApi";

// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
// import { SidebarTrigger } from "./ui/sidebar";

// import { usePathname, useRouter } from "next/navigation";

import { usePathname, useRouter } from 'next/navigation';
// import { SidebarTrigger } from './ui/sidebar'

// Con cac Copilot
// import { AccountProfile } from '../../../dispatch/src/account/accountProfile.chema';

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { useDispatch } from 'react-redux'
import { setProfile } from '@/store/accountSlice'


const LogoutHandler = (router: AppRouterInstance) => {
	console.log('Router:', router)
	const handleLogout = async () => {
		router.push("/auth/logout");
	};
	handleLogout()
}


const LogginedMenu = ({accountProfile}: {accountProfile?: AccountProfile}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    if (accountProfile) {
      dispatch(setProfile(accountProfile));
    }
  }, [accountProfile, dispatch]);

  const router = useRouter();
  const [unreadNotificationCount, setUnreadNotificationCount] = React.useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = React.useState(0);

  // Fetch unread counts on load and periodically
  React.useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const notificationCount = await getUnreadNotificationsCount();
        setUnreadNotificationCount(notificationCount);
        
        const messageCount = await getUnreadMessagesCount();
        setUnreadMessageCount(messageCount);
      } catch (error) {
        console.error('Failed to fetch unread counts:', error);
      }
    };

    // Fetch immediately
    fetchUnreadCounts();

    // Set up periodic polling every 30 seconds
    const intervalId = setInterval(fetchUnreadCounts, 30000);

    return () => clearInterval(intervalId);
  }, []);
  return (
    <>      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="relative hidden md:block">
            <MessageCircle className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
            {unreadMessageCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0">
          <div>
            <MessagesList />
            <DropdownMenuItem
              className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 border-t border-gray-200 py-2 text-center"
              onClick={() => router.push('/messages')}
            >
              View all messages
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none">
          <div className="relative hidden md:block">
            <Bell className="w-6 h-6 cursor-pointer text-primary-200 hover:text-primary-400" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 p-0">
          <NotificationsList />
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 focus:outline-none cursor-pointer">
          <Avatar>
            <AvatarImage src={accountProfile?.avatar}
				className='transition-transform duration-300 hover:scale-110' />
            <AvatarFallback className="bg-primary-600">
              {(accountProfile?.fullName?.charAt(0) || "U").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <p className="text-primary-200 hidden md:block">{accountProfile?.fullName}</p>
        </DropdownMenuTrigger><DropdownMenuContent className="bg-white text-primary-700 border rounded-md shadow-lg p-2">          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100 font-bold"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={() => router.push(`/profile/${accountProfile?._id}`)}
          >
            My Profile
          </DropdownMenuItem>          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={() => router.push('/posts/saved')}
          >
            Saved Posts
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={() => router.push('/search')}
          >
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={() => router.push('/profile/following-followers')}
          >
            Following & Followers
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-primary-200" />
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={() => router.push('/settings')}
          >
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer hover:!bg-primary-700 hover:!text-primary-100"
            onClick={()=>LogoutHandler(router)}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};


interface NavbarClientProps {
	isLoggedIn: boolean;
	accountProfile?: AccountProfile
}

const NavbarClient = ({
	isLoggedIn = false, 
	accountProfile
}: NavbarClientProps) => {
	// console.log("NavbarClient accountProfile", accountProfile)
	const pathname = usePathname();
	const router = useRouter();
	const isDashboardPage = pathname.includes("/") || pathname.includes("/tenants");


  	return (
	<div className='fixed top-0 left-0 w-full z-50 shadow-xl'
	style={{height: `${NAVBAR_HEIGHT}px`}}>
		<div className='flex justify-between items-center w-full py-3 px-8 bg-primary-700 text-white'>
			<div className="flex items-center gap-4 md:gap-6">
			{/* {isDashboardPage && (
				<div className="md:hidden">
				<SidebarTrigger />
				</div>
			)} */}

			<Link href="/landing"
				className='cursor-pointer hover:!text-primary-300'
				scroll={false} //turn of scroll to top automatically
			>
				<div className='flex items-center gap-3'>
					<Image
						src="/watablog_logo.png"
						width={400}
						height={160}
						alt="WataBlog logo"
						className="w-18 h-8 rounded-lg"
					/>
					<div className='text-xl font-bold'>
						Wata
						<span className='text-secondary-600 '>Blog
						</span>
					</div>
				</div>
			</Link>
			</div>

			{isDashboardPage && isLoggedIn && (
				<Button
				variant="secondary"
				className="md:ml-4 bg-primary-50 text-primary-700 hover:bg-secondary-500 
				hover:text-primary-50 cursor-pointer"
				onClick={() =>
					router.push('/posts')
				}
				>
				{(
					<>
					<Home className="h-4 w-4" />
					<span className="hidden md:block ml-2 w-full">
						GO TO MAIN PAGE
					</span>
					</>
				)}
				</Button>
			)}

			{!isDashboardPage &&
				<p className='text-primary-200 hidden md:block'>
					Great conversations begin with shared ideas. Write, discuss, and inspire
				</p>
			}
			<div className="flex items-center gap-5">
				{
				isLoggedIn ? (
					<LogginedMenu accountProfile={accountProfile}/>
				) : (
					<div className="flex items-center gap-4">
						<Link href="/signin">
							<Button
							className="text-white bg-transparent border border-white hover:text-primary-800 hover:bg-white rounded-lg cursor-pointer"
							>
							Sign in
							</Button>
						</Link>
						<Link href="/signup">
							<Button
							className="text-white bg-secondary-600 hover:text-primary-800 hover:bg-white rounded-lg cursor-pointer"
							variant="secondary"
							>
							Sign up
							</Button>
						</Link>
					</div>
				)
				}
			</div>

		</div>
	</div>
  )
}

export default NavbarClient
