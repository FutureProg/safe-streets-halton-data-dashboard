interface PagingParams {
    itemOffset: number;
    itemCount: number;
}

interface PagingResponseBody<T> {
    data: T[],
    offset: number,
    itemCount: number,
    hitRequestLimit: boolean
};

export const getPagingParams = (searchParams: URLSearchParams) => {
    const itemCount = parseInt(searchParams.get('itemCount') ?? "100");
    const itemOffset = parseInt(searchParams.get("itemOffset") ?? "0");
    return {
        itemCount, itemOffset
    }
}

export const createPagingResponseBody = <T>(data: T[], itemOffset: number, limit: number) : PagingResponseBody<T> => {
    return {
        data,
        offset: itemOffset,
        itemCount: data.length,
        hitRequestLimit: data.length >= limit
    }
}