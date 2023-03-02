async function snippetPagination(currentUserId, req, res, prisma) {
  const category = parseInt(req.query.category);
  // field to sort
  const sortBy = req.query.sortBy;
  // sorting order: asc or desc
  const sortOrder = req.query.sortOrder || "asc";

  const skip = parseInt(req.query.skip) || 0;
  const take = parseInt(req.query.take) || 5;

  const where = {};
  if (category) {
    where["category_id"] = {
      id: {
        in: category,
      },
    };
    where["usersId"] = currentUserId;
  } else {
    where["usersId"] = currentUserId;
  }

  const orderBy = {};
  if (sortBy) {
    orderBy[sortBy] = sortOrder;
  }

  const include = { tags: true, category_id: true };

  const snippets = await prisma.snippets.findMany({
    where,
    include,
    orderBy,
    skip,
    take,
  });

  const prevQuery = new URLSearchParams({
    skip: Math.max(skip - take, 0),
    take,
  });

  const nextQuery = new URLSearchParams({
    skip: skip + take,
    take,
  });

  res.json({
    pagination: {
      skip,
      take,
    },
    snippets,
    links: {
      prev: `/snippet?${prevQuery}`,
      next: `/snippet?${nextQuery}`,
    },
  });
}

export { snippetPagination };
