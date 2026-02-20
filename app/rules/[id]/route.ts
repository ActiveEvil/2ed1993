import { Database } from "@/database.types";
import slugify from "@sindresorhus/slugify";
import { createClient } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: RouteContext<"/rules/[id]">,
) {
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const { id } = await params;
  const { data: category } = await supabase
    .from("rule_categories")
    .select("name")
    .eq("id", Number(id))
    .single();
  const redirectTo = request.nextUrl.clone();

  if (category) {
    redirectTo.pathname = `/rules/${id}/${slugify(category.name)}`;
    return NextResponse.redirect(redirectTo, 308);
  }

  redirectTo.pathname = "/not-found";

  return NextResponse.redirect(redirectTo);
}
