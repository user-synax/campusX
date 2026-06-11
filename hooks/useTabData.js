"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import clientCache from "@/lib/client-cache";

export function useTabData(tabKey, fetchFn, options = {}) {
    const { ttl = 5 * 60 * 1000, initialData = null } = options;
    const cacheKey = useMemo(() => {
        return JSON.stringify(["tab", tabKey]);
    }, [tabKey]);

    const [data, setData] = useState(() => {
        const cached = clientCache.get(cacheKey);
        return cached || initialData;
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(() => !!clientCache.get(cacheKey));

    const fetchFnRef = useRef(fetchFn);

    useEffect(() => {
        fetchFnRef.current = fetchFn;
    }, [fetchFn]);

    const fetchData = useCallback(
        async (forceRefresh = false) => {
            if (!forceRefresh) {
                const cached = clientCache.get(cacheKey);
                if (cached) {
                    setData(cached);
                    setIsLoaded(true);
                    return cached;
                }
            }

            setLoading(true);
            setError(null);

            try {
                const result = await fetchFnRef.current();
                setData(result);
                setIsLoaded(true);
                clientCache.set(cacheKey, result, ttl);
                return result;
            } catch (err) {
                setError(err.message || "Failed to fetch data");
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [cacheKey, ttl],
    );

    const invalidate = useCallback(() => {
        clientCache.delete(cacheKey);
        setIsLoaded(false);
    }, [cacheKey]);

    return {
        data,
        loading,
        error,
        isLoaded,
        fetchData,
        invalidate,
        setData,
    };
}
