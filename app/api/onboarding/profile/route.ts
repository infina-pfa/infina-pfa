import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function PATCH(request: NextRequest) {
  try {
    const updates = await request.json();
    console.log("Received profile update request:", {
      updates,
      timestamp: new Date().toISOString()
    });

    if (!updates || Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: "Profile updates are required"
      }, { status: 400 });
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component context
            }
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required"
      }, { status: 401 });
    }

    // Separate fields that should go to users table vs onboarding_profiles table
    const userTableFields = ['name', 'total_asset_value', 'onboarding_completed', 'onboarding_completed_at'];
    const userUpdates: Record<string, unknown> = {};
    const profileData: Record<string, unknown> = {};

    // Separate the updates
    Object.entries(updates).forEach(([key, value]) => {
      if (userTableFields.includes(key)) {
        userUpdates[key] = value;
      } else {
        profileData[key] = value;
      }
    });

    console.log("Separated update fields:", {
      userTableFields,
      userUpdates,
      profileData,
      userId: user.id
    });

    // Update users table if there are valid user fields
    if (Object.keys(userUpdates).length > 0) {
      // First, check if user record exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingUser) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("users")
          .update({
            ...userUpdates,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (updateError) {
          console.error("Error updating user profile:", updateError);
          return NextResponse.json({
            success: false,
            error: "Failed to update profile"
          }, { status: 500 });
        }
      } else {
        // Insert new record - ensure required fields have defaults
        const insertData = {
          user_id: user.id,
          name: userUpdates.name || "User", // Default name if not provided
          total_asset_value: userUpdates.total_asset_value || 0,
          ...userUpdates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from("users")
          .insert(insertData);

        if (insertError) {
          console.error("Error creating user profile:", insertError);
          return NextResponse.json({
            success: false,
            error: "Failed to create profile"
          }, { status: 500 });
        }
      }
    }

    // Update onboarding_profiles table if there are profile data fields
    if (Object.keys(profileData).length > 0) {
      // First, get existing profile data
      const { data: existingProfile } = await supabase
        .from("onboarding_profiles")
        .select("profile_data")
        .eq("user_id", user.id)
        .single();

      // Merge with existing profile data
      const mergedProfileData = {
        ...(existingProfile?.profile_data || {}),
        ...profileData
      };

      if (existingProfile) {
        // Update existing record
        const { error: profileError } = await supabase
          .from("onboarding_profiles")
          .update({
            profile_data: mergedProfileData,
            updated_at: new Date().toISOString()
          })
          .eq("user_id", user.id);

        if (profileError) {
          console.error("Error updating onboarding profile:", profileError);
          return NextResponse.json({
            success: false,
            error: "Failed to update onboarding profile"
          }, { status: 500 });
        }
      } else {
        // Insert new record
        const { error: profileError } = await supabase
          .from("onboarding_profiles")
          .insert({
            user_id: user.id,
            profile_data: mergedProfileData,
            is_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error("Error creating onboarding profile:", profileError);
          return NextResponse.json({
            success: false,
            error: "Failed to create onboarding profile"
          }, { status: 500 });
        }
      }
    }

    console.log("Successfully updated user profile:", {
      userId: user.id,
      userUpdates,
      profileData,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: { updated: true }
    });

  } catch (error) {
    console.error("Error updating onboarding profile:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error"
    }, { status: 500 });
  }
} 