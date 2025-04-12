import { useCallback, useRef } from "react"

/**
 * Create a stable version of a function that can be used in dependency arrays
 * without causing hooks like useEffect to re-run if the function changes.
 * Calling the returned function always calls the most recent version of the
 * function that was passed to useStableFn.
 *
 * If you do want the function to be replaced when certain dependency values
 * change, include those values in the dependency array of useStableFn.
 */
export const useStableFn = (fn, deps) => {
  const fnRef = useRef(fn)
  fnRef.current = fn
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback((...args) => fnRef.current(...args), deps)
}
