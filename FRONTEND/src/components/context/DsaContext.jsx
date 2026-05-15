import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  fetchDsaProblem,
  fetchDsaProblems,
  fetchMyDsaAttempts,
  fetchMyDsaStats,
  executeDsaAttempt,
  submitDsaAttempt,
} from './Dsa.service';

const DsaContext = createContext(null);

export const DsaProvider = ({ children }) => {
  const [problems, setProblems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [attemptsSummary, setAttemptsSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [problemSummary, setProblemSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    topic: 'all',
    company: 'all',
    status: 'all',
    search: '',
  });

  const loadProblems = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    try {
      const [problemsData, attemptsData, statsData] = await Promise.all([
        fetchDsaProblems(nextFilters),
        fetchMyDsaAttempts(),
        fetchMyDsaStats(),
      ]);
      setProblems(problemsData.problems || []);
      setCategories(problemsData.categories || []);
      setTopics(problemsData.topics || []);
      setCompanies(problemsData.companies || []);
      setProblemSummary(problemsData.summary || null);
      setAttempts(attemptsData.attempts || []);
      setAttemptsSummary(attemptsData.summary || null);
      setStats(statsData || null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProblems(filters);
  }, [filters, loadProblems]);

  const getProblemBySlug = useCallback(async (slug) => {
    const data = await fetchDsaProblem(slug);
    return data;
  }, []);

  const saveAttempt = useCallback(async (problemId, payload) => {
    const data = await submitDsaAttempt(problemId, payload);
    const [problemsData, attemptsData, statsData] = await Promise.all([
      fetchDsaProblems(filters),
      fetchMyDsaAttempts(),
      fetchMyDsaStats(),
    ]);
    setProblems(problemsData.problems || []);
    setCategories(problemsData.categories || []);
    setTopics(problemsData.topics || []);
    setCompanies(problemsData.companies || []);
    setProblemSummary(problemsData.summary || null);
    setAttempts(attemptsData.attempts || []);
    setAttemptsSummary(attemptsData.summary || null);
    setStats(statsData || null);
    return data.attempt;
  }, [filters]);

  const runAttempt = useCallback(async (problemId, payload) => {
    const data = await executeDsaAttempt(problemId, payload);
    return data;
  }, []);

  const value = useMemo(() => ({
    problems,
    categories,
    topics,
    companies,
    attempts,
    attemptsSummary,
    stats,
    problemSummary,
    loading,
    filters,
    setFilters,
    refreshDsa: () => loadProblems(filters),
    getProblemBySlug,
    runAttempt,
    saveAttempt,
  }), [problems, categories, topics, companies, attempts, attemptsSummary, stats, problemSummary, loading, filters, loadProblems, getProblemBySlug, runAttempt, saveAttempt]);

  return <DsaContext.Provider value={value}>{children}</DsaContext.Provider>;
};

export const useDsa = () => {
  const context = useContext(DsaContext);
  if (!context) {
    throw new Error('useDsa must be used within a DsaProvider');
  }
  return context;
};
