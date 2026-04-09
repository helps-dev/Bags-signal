'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'

export interface FilterState {
  search: string
  status: 'all' | 'live' | 'pre-launch'
  bagsStatus: string[]
  scoreRange: 'all' | 'high' | 'medium' | 'low'
  sortBy: 'newest' | 'oldest' | 'volume-high' | 'volume-low' | 'score-high' | 'score-low' | 'name-az' | 'name-za'
  hasTwitter: boolean | null
  hasWebsite: boolean | null
}

interface FilterBarProps {
  filters: FilterState
  onFilterChange: (filters: FilterState) => void
  totalTokens: number
  filteredTokens: number
}

export default function FilterBar({ filters, onFilterChange, totalTokens, filteredTokens }: FilterBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFilterChange({
      search: '',
      status: 'all',
      bagsStatus: [],
      scoreRange: 'all',
      sortBy: 'newest',
      hasTwitter: null,
      hasWebsite: null,
    })
  }

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.bagsStatus.length > 0 ||
    filters.scoreRange !== 'all' ||
    filters.hasTwitter !== null ||
    filters.hasWebsite !== null

  return (
    <div className="mb-8 space-y-5">
      {/* Main Filter Bar */}
      <div className="glass-panel flex flex-col md:flex-row md:items-center gap-3 rounded-2xl p-2.5 shadow-lg relative z-10">
        {/* Search */}
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          <input
            type="text"
            placeholder="Search tokens or creators..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full rounded-xl border border-transparent bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/40 transition-all focus:border-primary-container/50 focus:bg-white/10 focus:ring-4 focus:ring-primary-container/10 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="appearance-none rounded-xl border border-transparent bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition-all hover:bg-white/10 focus:border-primary-container/50 focus:bg-white/10 focus:ring-4 focus:ring-primary-container/10 focus:outline-none cursor-pointer min-w-[120px]"
            >
              <option value="all" className="bg-[#1a1a1a]">All Status</option>
              <option value="live" className="bg-[#1a1a1a]">Live</option>
              <option value="pre-launch" className="bg-[#1a1a1a]">Pre-Launch</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          {/* Sort By */}
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value as any)}
              className="appearance-none rounded-xl border border-transparent bg-white/5 py-3 pl-4 pr-10 text-sm font-medium text-white transition-all hover:bg-white/10 focus:border-primary-container/50 focus:bg-white/10 focus:ring-4 focus:ring-primary-container/10 focus:outline-none cursor-pointer min-w-[150px]"
            >
              <option value="newest" className="bg-[#1a1a1a]">Newest First</option>
              <option value="oldest" className="bg-[#1a1a1a]">Oldest First</option>
              <option value="volume-high" className="bg-[#1a1a1a]">Highest Volume</option>
              <option value="volume-low" className="bg-[#1a1a1a]">Lowest Volume</option>
              <option value="score-high" className="bg-[#1a1a1a]">Highest Score</option>
              <option value="score-low" className="bg-[#1a1a1a]">Lowest Score</option>
              <option value="name-az" className="bg-[#1a1a1a]">Name A-Z</option>
              <option value="name-za" className="bg-[#1a1a1a]">Name Z-A</option>
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/50">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>

          <div className="w-px h-8 bg-white/10 mx-1 hidden md:block"></div>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`relative flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all shrink-0 ${
              showAdvanced || hasActiveFilters
                ? 'bg-primary-container text-on-primary-container shadow-[0_0_15px_rgba(0,255,163,0.3)]'
                : 'bg-white/5 text-white hover:bg-white/10'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-[#ff3366] ring-2 ring-[#131313]">
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div 
        className={`transition-all duration-300 ease-in-out origin-top overflow-hidden ${
          showAdvanced ? 'opacity-100 scale-y-100 max-h-[500px]' : 'opacity-0 scale-y-95 max-h-0'
        }`}
      >
        <div className="glass-card rounded-2xl p-6 relative border border-white/10 shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-container/50 to-transparent"></div>
          
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="absolute top-6 right-6 flex items-center gap-1.5 rounded-lg bg-error/10 px-3 py-1.5 text-xs font-bold text-[#ff3366] transition-colors hover:bg-error/20"
            >
              <X className="h-3 w-3" />
              Reset All
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* AI Score Range */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary-container">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-container/80"></span>
                Target Alpha Score
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'all', label: 'Any Score' },
                  { value: 'high', label: 'High (70+)' },
                  { value: 'medium', label: 'Med (60-69)' },
                  { value: 'low', label: 'Low (<59)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('scoreRange', opt.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      filters.scoreRange === opt.value
                        ? 'border-primary-container/50 bg-primary-container/10 text-primary-container'
                        : 'border-white/5 bg-white/5 text-white/70 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bags Status */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#00E5FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00E5FF]/80"></span>
                Launch Phase
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['MIGRATED', 'PRE_GRAD', 'MIGRATING', 'PRE_LAUNCH'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      const newStatuses = filters.bagsStatus.includes(status)
                        ? filters.bagsStatus.filter((s) => s !== status)
                        : [...filters.bagsStatus, status]
                      updateFilter('bagsStatus', newStatuses)
                    }}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                      filters.bagsStatus.includes(status)
                        ? 'border-[#00E5FF]/50 bg-[#00E5FF]/10 text-[#00E5FF]'
                        : 'border-white/5 bg-white/5 text-white/70 hover:border-white/15 hover:text-white'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#B388FF]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B388FF]/80"></span>
                Verification Links
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 text-sm font-medium text-white transition-colors hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasTwitter === true}
                    onChange={(e) => updateFilter('hasTwitter', e.target.checked ? true : null)}
                    className="h-4 w-4 rounded border-white/20 bg-[#131313] text-[#B388FF] focus:ring-2 focus:ring-[#B388FF] focus:ring-offset-[#131313]"
                  />
                  Has Verified X (Twitter)
                </label>
                <label className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 text-sm font-medium text-white transition-colors hover:bg-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasWebsite === true}
                    onChange={(e) => updateFilter('hasWebsite', e.target.checked ? true : null)}
                    className="h-4 w-4 rounded border-white/20 bg-[#131313] text-[#B388FF] focus:ring-2 focus:ring-[#B388FF] focus:ring-offset-[#131313]"
                  />
                  Has Project Website
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-1 flex items-center justify-between text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
        <span>
          Showing <span className="text-white">{filteredTokens}</span> of {totalTokens} tokens
        </span>
        {hasActiveFilters && (
          <span className="text-primary-container">
            {totalTokens - filteredTokens} filtered out
          </span>
        )}
      </div>
    </div>
  )
}
