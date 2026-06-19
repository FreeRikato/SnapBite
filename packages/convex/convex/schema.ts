import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  meals: defineTable({
    userKey: v.string(),
    status: v.union(v.literal("saved"), v.literal("draft")),
    thumbnailKey: v.union(v.string(), v.null()),
    photos: v.array(
      v.object({
        key: v.string(),
        contentType: v.string(),
        size: v.number(),
        width: v.union(v.number(), v.null()),
        height: v.union(v.number(), v.null()),
        etag: v.union(v.string(), v.null()),
      }),
    ),
    name: v.string(),
    kcal: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    uploadedAt: v.string(),
    foodItems: v.array(
      v.object({
        id: v.string(),
        emoji: v.string(),
        name: v.string(),
        quantity: v.number(),
        unit: v.union(
          v.literal("Plates"),
          v.literal("Pieces"),
          v.literal("Grams"),
          v.literal("ml"),
          v.literal("l"),
        ),
      }),
    ),
  })
    .index("by_userKey_and_uploadedAt", ["userKey", "uploadedAt"])
    .index("by_userKey_and_status_and_uploadedAt", [
      "userKey",
      "status",
      "uploadedAt",
    ]),
  tasks: defineTable({
    title: v.string(),
    isCompleted: v.boolean(),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
});
