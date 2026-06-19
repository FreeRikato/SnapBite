import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const mealStatus = v.union(v.literal("saved"), v.literal("draft"));
const foodUnit = v.union(
  v.literal("Plates"),
  v.literal("Pieces"),
  v.literal("Grams"),
  v.literal("ml"),
  v.literal("l"),
);

const foodItem = v.object({
  id: v.string(),
  emoji: v.string(),
  name: v.string(),
  quantity: v.number(),
  unit: foodUnit,
});

const uploadedPhoto = v.object({
  key: v.string(),
  contentType: v.string(),
  size: v.number(),
  width: v.union(v.number(), v.null()),
  height: v.union(v.number(), v.null()),
  etag: v.union(v.string(), v.null()),
});

async function getUserKey(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity?.tokenIdentifier ?? "demo-user";
}

function roundNonNegative(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function logMealDelete(message: string, data: Record<string, unknown>) {
  console.info("[SnapBite delete]", message, {
    source: "convex.meals.remove",
    ...data,
  });
}

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userKey = await getUserKey(ctx);
    const limit = Math.min(Math.max(args.limit ?? 20, 1), 50);

    return await ctx.db
      .query("meals")
      .withIndex("by_userKey_and_uploadedAt", (q) => q.eq("userKey", userKey))
      .order("desc")
      .take(limit);
  },
});

export const getById = query({
  args: {
    id: v.id("meals"),
  },
  handler: async (ctx, args) => {
    const userKey = await getUserKey(ctx);
    const meal = await ctx.db.get(args.id);

    if (!meal || meal.userKey !== userKey) {
      return null;
    }

    return meal;
  },
});

export const create = mutation({
  args: {
    status: mealStatus,
    photos: v.array(uploadedPhoto),
    name: v.string(),
    kcal: v.number(),
    uploadedAt: v.string(),
    foodItems: v.array(foodItem),
  },
  handler: async (ctx, args) => {
    const userKey = await getUserKey(ctx);
    const kcal = roundNonNegative(args.kcal);

    return await ctx.db.insert("meals", {
      userKey,
      status: args.status,
      thumbnailKey: args.photos[0]?.key ?? null,
      photos: args.photos,
      name: args.name.trim() || "Analyzed meal",
      kcal,
      protein: 0,
      carbs: 0,
      fat: 0,
      uploadedAt: args.uploadedAt,
      foodItems: args.foodItems,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.id("meals"),
  },
  handler: async (ctx, args) => {
    const userKey = await getUserKey(ctx);
    const meal = await ctx.db.get(args.id);

    logMealDelete("remove requested", {
      mealId: args.id,
      mealFound: Boolean(meal),
      ownerMatches: meal?.userKey === userKey,
      photoKeyCount: meal?.photos.length ?? 0,
      thumbnailKey: meal?.thumbnailKey ?? null,
    });

    if (!meal || meal.userKey !== userKey) {
      logMealDelete("remove rejected", {
        mealId: args.id,
        reason: !meal ? "not-found" : "owner-mismatch",
      });
      return {
        deleted: false,
        photoKeys: [],
      };
    }

    const photoKeys = Array.from(
      new Set([
        ...meal.photos.map((photo) => photo.key),
        meal.thumbnailKey,
      ].filter((key): key is string => Boolean(key))),
    );

    await ctx.db.delete(args.id);

    logMealDelete("remove complete", {
      mealId: args.id,
      photoKeyCount: photoKeys.length,
      photoKeys,
    });

    return {
      deleted: true,
      photoKeys,
    };
  },
});
