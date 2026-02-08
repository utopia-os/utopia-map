import type { Item } from '#types/Item'
import type { Tag } from '#types/Tag'

/**
 * Pure helper that filters items by layer and tags, sorts by date (newest first),
 * and returns a paginated slice.
 *
 * Extracted from OverlayItemsIndexPage for testability.
 *
 * @category Templates
 */
export function filterSortAndPaginate(
  items: Item[],
  layerName: string,
  filterTags: Tag[],
  getItemTags: (item: Item) => Tag[],
  itemsToShow: number,
): { visibleItems: Item[]; hasMore: boolean } {
  const filteredAndSortedItems = items
    .filter((i) => i.layer?.name === layerName)
    .filter((item) =>
      filterTags.length === 0
        ? true
        : filterTags.some((tag) =>
            getItemTags(item).some(
              (itemTag) => itemTag.name.toLocaleLowerCase() === tag.name.toLocaleLowerCase(),
            ),
          ),
    )
    .sort((a, b) => {
      const dateA = a.date_updated
        ? new Date(a.date_updated).getTime()
        : a.date_created
          ? new Date(a.date_created).getTime()
          : 0
      const dateB = b.date_updated
        ? new Date(b.date_updated).getTime()
        : b.date_created
          ? new Date(b.date_created).getTime()
          : 0
      return dateB - dateA
    })

  const visibleItems = filteredAndSortedItems.slice(0, itemsToShow)
  const hasMore = filteredAndSortedItems.length > itemsToShow

  return { visibleItems, hasMore }
}
