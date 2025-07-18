import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Get user profile from users table
    const { data: userProfile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (profileError) {
      // If user profile doesn't exist in users table, return basic info from auth
      return NextResponse.json({
        success: true,
        data: {
          user_id: user.id,
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User",
          email: user.email,
          total_asset_value: 0,
          onboarding_completed_at: null,
          financial_stage: null,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error in users profile GET:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, total_asset_value } = body;

    // Validate required fields
    if (!name?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is required",
        },
        { status: 400 }
      );
    }

    // Create user profile
    const { data: userProfile, error } = await supabase
      .from("users")
      .insert({
        user_id: user.id,
        name: name.trim(),
        total_asset_value: total_asset_value || 0,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user profile",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error in users profile POST:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Only update provided fields
    if (body.name !== undefined) {
      if (!body.name?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: "Name cannot be empty",
          },
          { status: 400 }
        );
      }
      updateData.name = body.name.trim();
    }

    if (body.total_asset_value !== undefined) {
      updateData.total_asset_value = body.total_asset_value;
    }

    if (body.onboarding_completed_at !== undefined) {
      updateData.onboarding_completed_at = body.onboarding_completed_at;
    }

    if (body.profileData?.identifiedStage !== undefined) {
      // Validate financial_stage values
      const validStages = ["debt", "no_saving", "start_investing"];
      if (!validStages.includes(body.profileData.identifiedStage)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid financial_stage. Must be one of: ${validStages.join(
              ", "
            )}`,
          },
          { status: 400 }
        );
      }
      updateData.financial_stage = body.profileData.identifiedStage;
    }

    if (body.updated_at !== undefined) {
      updateData.updated_at = body.updated_at;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    // Check if user profile exists first
    const { data: existingProfile } = await supabase
      .from("users")
      .select("id")
      .eq("user_id", user.id)
      .single();

    let userProfile;

    if (existingProfile) {
      // Update existing user profile
      const { data, error } = await supabase
        .from("users")
        .update(updateData)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        console.error("Error updating user profile:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to update user profile",
          },
          { status: 500 }
        );
      }
      userProfile = data;
    } else {
      console.log("🚀 ~ PATCH ~ updateData:", updateData);
      // Create new user profile if it doesn't exist
      const insertData = {
        user_id: user.id,
        name:
          updateData.name ||
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "User",
        total_asset_value: updateData.total_asset_value || 0,
        ...updateData,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("users")
        .insert(insertData)
        .select("*")
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        return NextResponse.json(
          {
            success: false,
            error: "Failed to create user profile",
          },
          { status: 500 }
        );
      }
      userProfile = data;
    }

    return NextResponse.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Error in users profile PATCH:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
