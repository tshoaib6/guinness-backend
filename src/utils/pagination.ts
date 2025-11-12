export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string; // optional, handled by service
}

export interface PaginationResult<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}


export const paginate = async <T>(
  model: any,
  query: any = {},
  options: PaginationOptions = {},
  selectFields?: string
): Promise<PaginationResult<T>> => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 20;
  const sortBy = options.sortBy || "createdAt";
  const sortOrder = options.sortOrder === "asc" ? 1 : -1;


  const total = await model.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  const data = await model
    .find(query)
    .select(selectFields || "")
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return { total, page, limit, totalPages, data };
};
