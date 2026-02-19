import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Check, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { onboardingApi } from "@/lib/api/onboarding";

export function OnboardingPage() {
  const { t } = useTranslation('translation', { keyPrefix: 'onboarding' });
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = loading state
  const [domain, setDomain] = useState("");
  const [keywords, setKeywords] = useState(["", ""]);
  const [competitors, setCompetitors] = useState(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainId, setDomainId] = useState<number | undefined>(undefined);
  const [keywordLimit, setKeywordLimit] = useState(3);
  const [competitorLimit, setCompetitorLimit] = useState(2);
  const [competitorsEnabled, setCompetitorsEnabled] = useState(false);

  useEffect(() => {
    onboardingApi.getState().then((state) => {
      setKeywordLimit(state.keywordLimit);
      setCompetitorLimit(state.competitorLimit);
      setCompetitorsEnabled(state.competitorsEnabled);

      // Determine initial step based on state
      if (!state.hasDomain) {
        setStep(1);
      } else if (!state.hasKeywords) {
        setStep(2);
      } else if (state.competitorsEnabled && !state.hasCompetitors) {
        setStep(3);
      } else {
        setStep(4);
      }
    });
  }, []);

  const addKeyword = () => {
    if (keywords.length < keywordLimit) {
      setKeywords([...keywords, ""]);
    }
  };

  const addCompetitor = () => {
    if (competitors.length < competitorLimit) {
      setCompetitors([...competitors, ""]);
    }
  };

  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...keywords];
    newKeywords[index] = value;
    setKeywords(newKeywords);
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };

  const handleStep1Continue = async () => {
    setError(null);
    if (!domain.trim()) {
      setError("Please enter your domain");
      return;
    }

    setIsLoading(true);
    try {
      const result = await onboardingApi.submitDomain(domain);
      setDomainId(result.id);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Continue = async () => {
    setError(null);
    const validKeywords = keywords.filter((k) => k.trim().length > 0);
    if (validKeywords.length === 0) {
      setError("Please add at least one keyword");
      return;
    }

    setIsLoading(true);
    try {
      await onboardingApi.submitKeywords(validKeywords, domainId);
      setStep(competitorsEnabled ? 3 : 4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add keywords");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Complete = async () => {
    setError(null);
    const validCompetitors = competitors.filter((c) => c.trim().length > 0);

    setIsLoading(true);
    try {
      await onboardingApi.submitCompetitors(validCompetitors);
      setStep(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add competitors");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    navigate("/dashboard");
  };

  const suggestions = [
    "project management",
    "team collaboration",
    "productivity app",
    "task management",
  ];

  const totalSteps = competitorsEnabled ? 4 : 3;
  // Map internal step to display step for progress
  const displayStep = !competitorsEnabled && step === 4 ? 3 : step;

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 bg-hero-glow" />

      <div className="relative flex min-h-screen flex-col items-center px-4 py-12">
        <Logo href="/" className="mb-8" />

        {/* Progress */}
        <div className="mb-8 w-full max-w-md">
          <Progress value={step === 0 ? 0 : (displayStep / totalSteps) * 100} className="h-2" />
        </div>

        {step === 0 && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Domain */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-primary">{t("step1.progress")}</p>
                  <h1 className="mt-2 text-2xl font-bold">{t("step1.title")}</h1>
                  <p className="mt-1 text-muted-foreground">{t("step1.subtitle")}</p>

                  <div className="mt-6 space-y-4">
                    {error && (
                      <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="domain">{t("step1.label")}</Label>
                      <Input
                        id="domain"
                        placeholder={t("step1.placeholder")}
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {t("step1.helper")}
                      </p>
                    </div>
                    <Button
                      className="w-full hero-gradient"
                      onClick={handleStep1Continue}
                      disabled={isLoading}
                    >
                      {t("step1.continue")} →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Keywords */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-primary">{t("step2.progress")}</p>
                  <h1 className="mt-2 text-2xl font-bold">{t("step2.title")}</h1>
                  <p className="mt-1 text-muted-foreground">{t("step2.subtitle")}</p>

                  <div className="mt-6 space-y-4">
                    {error && (
                      <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {keywords.map((value, index) => (
                      <div key={index} className="space-y-2">
                        <Label>
                          {t("step2.keywordLabel")} {index + 1}
                        </Label>
                        <Input
                          placeholder={t("step2.placeholder")}
                          value={value}
                          onChange={(e) => handleKeywordChange(index, e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full gap-2"
                        onClick={addKeyword}
                        disabled={isLoading || keywords.length >= keywordLimit}
                      >
                        <Plus className="h-4 w-4" />
                        {t("step2.addAnother")}
                      </Button>
                      {keywords.length >= keywordLimit && (
                        <p className="text-xs text-muted-foreground">
                          {t("step2.limitReached")}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm font-medium">{t("step2.suggestions")}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {suggestions.map((suggestion) => (
                          <Badge
                            key={suggestion}
                            variant="secondary"
                            className="cursor-pointer hover:bg-primary/20"
                            onClick={() => {
                              if (!keywords.some((k) => k === suggestion) && keywords.length < keywordLimit) {
                                setKeywords([...keywords, suggestion]);
                              }
                            }}
                          >
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button
                      className="w-full hero-gradient"
                      onClick={handleStep2Continue}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          {t("step2.continue")} →
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Competitors */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full max-w-md"
            >
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-primary">{t("step3.progress")}</p>
                  <h1 className="mt-2 text-2xl font-bold">{t("step3.title")}</h1>
                  <p className="mt-1 text-muted-foreground">{t("step3.subtitle")}</p>

                  <div className="mt-6 space-y-4">
                    {error && (
                      <div className="flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    {competitors.map((value, index) => (
                      <div key={index} className="space-y-2">
                        <Label>
                          {t("step3.competitorLabel")} {index + 1}
                        </Label>
                        <Input
                          placeholder={t("step3.placeholder")}
                          value={value}
                          onChange={(e) => handleCompetitorChange(index, e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    ))}
                    {competitors.length >= competitorLimit && (
                      <p className="text-xs text-muted-foreground">
                        {t("step3.limitReached")}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className="flex-1"
                        onClick={handleStep3Complete}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          t("step3.skip")
                        )}
                      </Button>
                      <Button
                        className="flex-1 hero-gradient"
                        onClick={handleStep3Complete}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            {t("step3.start")} →
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-md text-center"
            >
              <Card>
                <CardContent className="p-8">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="mt-6 text-2xl font-bold">{t("complete.title")}</h1>
                  <p className="mt-2 text-muted-foreground">
                    {t("complete.subtitle")}
                  </p>

                  <div className="mt-6 rounded-lg border border-border p-4 text-left">
                    <p className="font-medium">{t("complete.whatNext")}</p>
                    <ul className="mt-3 space-y-2">
                      {(t("complete.steps", { returnObjects: true }) as string[]).map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    className="mt-6 w-full hero-gradient"
                    onClick={handleComplete}
                  >
                    {t("complete.goToDashboard")} →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
