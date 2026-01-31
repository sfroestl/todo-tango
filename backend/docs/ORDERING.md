# Ordering todo items

## Current approach: integer `order`

- Each **TodoItem** has an optional **`order`** field (default `0` when empty).
- **List items** are returned sorted by `(order, id)`.
- **Create**: `POST` body can include `order`; omitted → `0`.
- **Update**: `PATCH` can set `order` to reorder an item.

### Edge cases

| Case | Behavior |
|------|----------|
| **Two items same `order`** | Sort is stable: secondary key is `id`, so order between them is deterministic (e.g. creation order by id). No automatic renumbering. |
| **Gaps in values** | Allowed (e.g. 0, 10, 20). Makes inserting “between” easy without rewriting many rows. |
| **Negative / large numbers** | Allowed. No uniqueness constraint on `order`. |

Reordering in the UI: client can send new `order` values for one or more items (e.g. after drag-and-drop). If the client sends the same `order` for two items, they keep a stable relative order by `id`.

---

## Alternative: fractional indexing (Lexorank-style)

- Store a **string position** between two others (e.g. between `"a"` and `"b"` → `"am"`).
- **Pros**: No ties; insert/move in O(1) without updating other rows; no bulk renumbering.
- **Cons**: More complex (library like `fractional-indexing` or custom midpoint logic); string comparison for sort; slightly more storage.
- **When to consider**: Many reorders, collaborative lists, or when you want to avoid ever touching other items on a single move.

The current integer `order` is simpler and sufficient for typical todo lists; we can switch to fractional indexing later if reordering scale or concurrency demands it.
