// Device & Layout Hooks
export { 
  useIsMobile, 
  useBreakpoints 
} from './useIsMobile'

// Storage Hooks
export { 
  useLocalStorage, 
  useSessionStorage 
} from './useLocalStorage'

// Performance Hooks
export { 
  useDebounce, 
  useDebouncedCallback, 
  useThrottledCallback, 
  useSearch 
} from './useDebounce'

// Intersection Observer Hooks
export { 
  useIntersectionObserver,
  useScrollAnimation,
  useLazyImage,
  useInfiniteScroll,
  useMultipleIntersectionObserver
} from './useIntersectionObserver'

// Media Hooks
export { 
  useVideo 
} from './useVideo'

// Re-export defaults
export { default as useIsMobile } from './useIsMobile'
export { default as useLocalStorage } from './useLocalStorage'
export { default as useDebounce } from './useDebounce'
export { default as useIntersectionObserver } from './useIntersectionObserver'
export { default as useVideo } from './useVideo'