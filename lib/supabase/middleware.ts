import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // If user is authenticated
  // if (user) {
  //   // Allow access to onboarding page without checking profile
  //   if (pathname.startsWith("/onboarding")) {
  //     return supabaseResponse;
  //   }

  //   // Check if user has completed onboarding (has a profile in public.users)
  //   try {
  //     const { data: userProfile, error } = await supabase
  //       .from("users")
  //       .select("id")
  //       .eq("user_id", user.id)
  //       .single();

  //     // If user doesn't have a profile, redirect to onboarding
  //     if (error && error.code === 'PGRST116') {
  //       // User profile doesn't exist - redirect to onboarding
  //       if (pathname !== "/onboarding") {
  //         const url = request.nextUrl.clone();
  //         url.pathname = "/onboarding";
  //         return NextResponse.redirect(url);
  //       }
  //     }

  //     // If user has a profile and trying to access landing/auth/onboarding pages, redirect to chat
  //     if (userProfile && (
  //       pathname === "/" ||
  //       pathname.startsWith("/auth/sign-in") ||
  //       pathname.startsWith("/auth/sign-up") ||
  //       pathname.startsWith("/auth/forgot-password") ||
  //       pathname.startsWith("/onboarding")
  //     )) {
  //       const url = request.nextUrl.clone();
  //       url.pathname = "/chat";
  //       return NextResponse.redirect(url);
  //     }
  //   } catch (error) {
  //     // If there's an error checking the profile, allow access but log the error
  //     console.error("Error checking user profile in middleware:", error);
  //   }
  // }

  if (
    pathname.startsWith("/api/chat/prompt-test") &&
    process.env.ENV === "development"
  ) {
    return supabaseResponse;
  }

  // If user is not authenticated and trying to access protected pages, redirect to sign-in
  if (!user) {
    const isPublicPage =
      pathname === "/" ||
      pathname.startsWith("/auth/sign-in") ||
      pathname.startsWith("/auth/sign-up") ||
      pathname.startsWith("/auth/forgot-password") ||
      pathname.startsWith("/auth/reset-password") ||
      pathname.startsWith("/auth/verify");

    if (!isPublicPage) {
      // Redirect unauthenticated users to sign-in page
      const url = request.nextUrl.clone();
      url.pathname = "/auth/sign-in";
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object here instead of the supabaseResponse object

  return supabaseResponse;
};
