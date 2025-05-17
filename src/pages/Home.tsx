"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Laugh, TrendingUp, Clock, Filter, Search, RefreshCw, Zap, Bookmark, FlameIcon as Fire } from "lucide-react"
import MemeCard from "../components/meme/MemeCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { getMemes, type Meme, TIME_FRAMES, getTrendingTags } from "../services/memeService"
import { useToast } from "../hooks/useToast"
import { useInView } from "react-intersection-observer"

const sortOptions = [
  { value: "new", label: "Newest", icon: <Clock size={16} /> },
  { value: "top", label: "Top", icon: <TrendingUp size={16} /> },
  { value: "hot", label: "Hot", icon: <Fire size={16} /> },
]

const Home = () => {
  const { showToast } = useToast()
  const [memes, setMemes] = useState<Meme[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sort, setSort] = useState("new")
  const [timeFrame, setTimeFrame] = useState<"24h" | "week" | "month" | "all">("all")
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined)
  const [trendingTags, setTrendingTags] = useState<{ tag: string; count: number }[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [savedMemes, setSavedMemes] = useState<string[]>([])
  const [showSaved, setShowSaved] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")

  // Infinite scroll setup
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // Search input ref for focus
  const searchInputRef = useRef<HTMLInputElement>(null)

  const fetchMemes = async (reset = false) => {
    try {
      const newPage = reset ? 1 : page
      if (reset) setLoading(true)
      else setLoadingMore(true)

      // If showing saved memes, filter from local storage instead of API call
      if (showSaved) {
        const savedMemeIds = JSON.parse(localStorage.getItem("savedMemes") || "[]")
        const response = await getMemes(1, 100, sort, timeFrame, selectedTag, searchQuery, savedMemeIds)

        setMemes(response.memes)
        setHasMore(false) // No pagination for saved memes
        setPage(1)
      } else {
        const response = await getMemes(newPage, 10, sort, timeFrame, selectedTag, searchQuery)

        if (reset) {
          setMemes(response.memes)
        } else {
          setMemes((prev) => [...prev, ...response.memes])
        }

        setHasMore(response.hasMore)
        setPage(newPage + 1)
      }
    } catch (error) {
      showToast("Failed to load memes", "error")
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setIsRefreshing(false)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const tags = await getTrendingTags(10)
      setTrendingTags(tags)
    } catch (error) {
      console.error("Failed to load trending tags", error)
    }
  }

  useEffect(() => {
    // Load saved memes from localStorage
    const savedMemeIds = JSON.parse(localStorage.getItem("savedMemes") || "[]")
    setSavedMemes(savedMemeIds)

    fetchMemes(true)
    fetchTrendingTags()
  }, [sort, timeFrame, selectedTag, searchQuery, showSaved])

  // Infinite scroll effect
  useEffect(() => {
    if (inView && hasMore && !loading && !loadingMore) {
      handleLoadMore()
    }
  }, [inView])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchMemes()
    }
  }

  const handleSortChange = (newSort: string) => {
    if (sort !== newSort) {
      setSort(newSort)
      setPage(1)
    }
  }

  const handleTimeFrameChange = (newTimeFrame: "24h" | "week" | "month" | "all") => {
    if (timeFrame !== newTimeFrame) {
      setTimeFrame(newTimeFrame)
      setPage(1)
    }
  }

  const handleTagSelect = (tag: string | undefined) => {
    setSelectedTag(tag)
    setPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMemes(true)
  }

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchMemes(true)
    fetchTrendingTags()
  }

  const toggleSavedMemes = () => {
    setShowSaved(!showSaved)
  }

  const toggleSaveMeme = (memeId: string) => {
    let updatedSavedMemes: string[]

    if (savedMemes.includes(memeId)) {
      updatedSavedMemes = savedMemes.filter((id) => id !== memeId)
      showToast("Meme removed from saved", "info")
    } else {
      updatedSavedMemes = [...savedMemes, memeId]
      showToast("Meme saved successfully", "success")
    }

    setSavedMemes(updatedSavedMemes)
    localStorage.setItem("savedMemes", JSON.stringify(updatedSavedMemes))

    // If we're in saved view, refresh the list
    if (showSaved) {
      fetchMemes(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Focus search on / key
    if (e.key === "/" && document.activeElement !== searchInputRef.current) {
      e.preventDefault()
      searchInputRef.current?.focus()
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown as any)
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 pb-10" onKeyDown={handleKeyDown}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center mb-2">
          <Laugh className="h-8 w-8 mr-2 text-primary-500" />
          <h1 className="text-3xl font-display font-bold">MemeHub</h1>
        </div>
        <p className="text-lg">The Internet's Playground for Memes</p>
      </motion.div>

      <div className="mb-6 bg-base-100 rounded-lg p-4 shadow-md">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search memes... (Press '/' to focus)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <span className="text-gray-400 hover:text-gray-600">×</span>
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-wrap gap-2 justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  sort === option.value ? "bg-primary-500 text-white" : "hover:bg-base-300"
                }`}
              >
                <span className="mr-1">{option.icon}</span>
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-base-300 transition-colors"
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={`mr-1 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>

            <button
              onClick={toggleSavedMemes}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                showSaved ? "bg-accent-500 text-white" : "hover:bg-base-300"
              }`}
            >
              <Bookmark size={16} className="mr-1" />
              {showSaved ? "All Memes" : "Saved"}
              {!showSaved && savedMemes.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                  {savedMemes.length}
                </span>
              )}
            </button>

            <div className="flex rounded-md overflow-hidden border border-gray-300">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2 py-1 ${viewMode === "list" ? "bg-gray-200" : "bg-white"}`}
                title="List view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 ${viewMode === "grid" ? "bg-gray-200" : "bg-white"}`}
                title="Grid view"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {sort === "top" && (
          <div className="flex space-x-2 w-full overflow-x-auto pb-2 mb-4">
            {TIME_FRAMES.map((frame) => (
              <button
                key={frame.value}
                onClick={() => handleTimeFrameChange(frame.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  timeFrame === frame.value ? "bg-secondary-500 text-white" : "hover:bg-base-300"
                }`}
              >
                {frame.label}
              </button>
            ))}
          </div>
        )}

        {trendingTags.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Filter size={16} className="mr-1" />
              <span className="text-sm font-medium">Trending Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTag && (
                <button
                  onClick={() => handleTagSelect(undefined)}
                  className="px-2 py-1 bg-base-300 hover:bg-base-200 rounded-full text-xs font-medium transition-colors"
                >
                  Clear Filter
                </button>
              )}
              {trendingTags.map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => handleTagSelect(tag.tag)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedTag === tag.tag ? "bg-accent-500 text-white" : "bg-base-300 hover:bg-base-200"
                  }`}
                >
                  #{tag.tag} <span className="opacity-70">({tag.count})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner size="lg" />
        </div>
      ) : memes.length === 0 ? (
        <div className="text-center py-10 bg-base-100 rounded-lg shadow-md">
          <Laugh className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium mb-2">No memes found</h3>
          <p className="text-gray-500">
            {showSaved
              ? "You haven't saved any memes yet"
              : selectedTag
                ? `No memes found with the tag #${selectedTag}`
                : searchQuery
                  ? `No results found for "${searchQuery}"`
                  : "Be the first to create a meme!"}
          </p>
          {showSaved && (
            <button
              onClick={toggleSavedMemes}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
            >
              Browse All Memes
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-6" : "space-y-6"}>
            <AnimatePresence>
              {memes.map((meme, index) => (
                <motion.div
                  key={meme._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MemeCard
                    meme={meme}
                    onVote={fetchMemes}
                    isSaved={savedMemes.includes(meme._id)}
                    onToggleSave={() => toggleSaveMeme(meme._id)}
                    compact={viewMode === "grid"}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center mt-6 py-4">
              {loadingMore ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" color="text-primary-500" />
                  <span className="ml-2">Loading more memes...</span>
                </div>
              ) : (
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
                >
                  Load More Memes
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Quick scroll to top button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bottom-6 right-6 p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Zap size={20} />
      </motion.button>
    </div>
  )
}

export default Home
