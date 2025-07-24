"use client";

import { useState, useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  ArrowDown,
  Briefcase,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Lightbulb,
  Loader2,
  PiggyBank,
  RefreshCcw,
  Users,
} from "lucide-react";

import {
  suggestROIParameters,
  type SuggestROIParametersInput,
} from "@/ai/flows/suggest-roi-parameters";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SavingsChart } from "@/components/savings-chart";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  // Current Metrics
  annualHires: z.coerce.number().min(0, "Must be a positive number"),
  interviewsPerHire: z.coerce.number().min(0, "Must be a positive number"),
  timeToHire: z.coerce.number().min(0, "Must be a positive number"),
  costPerHire: z.coerce.number().min(0, "Must be a positive number"),
  employeeTurnoverRate: z.coerce
    .number()
    .min(0, "Must be between 0 and 100")
    .max(100, "Must be between 0 and 100"),
  avgSalary: z.coerce.number().min(0, "Must be a positive number"),

  // Impact Parameters
  timeToHireReduction: z.coerce.number().min(0, "Must be a positive number"),
  costPerHireReduction: z.coerce.number().min(0, "Must be a positive number"),
  employeeTurnoverReduction: z.coerce
    .number()
    .min(0, "Must be between 0 and 100"),
});

type FormValues = z.infer<typeof formSchema>;

const initialValues: FormValues = {
  annualHires: 100,
  interviewsPerHire: 8,
  timeToHire: 45,
  costPerHire: 5000,
  employeeTurnoverRate: 15,
  avgSalary: 80000,
  timeToHireReduction: 0,
  costPerHireReduction: 0,
  employeeTurnoverReduction: 0,
};

export default function RoiCalculator() {
  const { toast } = useToast();
  const [isSuggesting, startSuggestionTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const watchedValues = form.watch();

  const savings = useMemo(() => {
    const {
      annualHires,
      avgSalary,
      timeToHireReduction,
      costPerHireReduction,
      employeeTurnoverReduction,
    } = watchedValues;

    if (!annualHires || !avgSalary) {
        return { time: 0, cost: 0, turnover: 0, total: 0 };
    }

    const timeSavings =
      (avgSalary / 365) * timeToHireReduction * annualHires;
    const costPerHireSavings = costPerHireReduction * annualHires;
    // Assuming cost of turnover is 50% of annual salary
    const turnoverSavings =
      (employeeTurnoverReduction / 100) * annualHires * (avgSalary * 0.5);
    const totalSavings = timeSavings + costPerHireSavings + turnoverSavings;

    return {
      time: timeSavings,
      cost: costPerHireSavings,
      turnover: turnoverSavings,
      total: totalSavings,
    };
  }, [watchedValues]);

  const chartData = [
    { name: "Time Savings", value: savings.time, fill: "var(--color-chart-1)" },
    { name: "Hiring Cost Savings", value: savings.cost, fill: "var(--color-chart-2)" },
    { name: "Turnover Reduction Savings", value: savings.turnover, fill: "var(--color-chart-3)" },
  ];
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSuggest = () => {
    startSuggestionTransition(async () => {
      try {
        const currentMetrics = form.getValues();
        const aiInput: SuggestROIParametersInput = {
          timeToHire: currentMetrics.timeToHire,
          costPerHire: currentMetrics.costPerHire,
          employeeTurnoverRate: currentMetrics.employeeTurnoverRate,
          interviewVolume: Math.round(
            (currentMetrics.annualHires * currentMetrics.interviewsPerHire) / 12
          ),
        };
        const result = await suggestROIParameters(aiInput);
        const params = result.intervueImpactParameters;
        
        form.setValue("timeToHireReduction", Math.max(0, Math.round(params.timeToHireReduction)), { shouldValidate: true });
        form.setValue("costPerHireReduction", Math.max(0, Math.round(params.costPerHireReduction)), { shouldValidate: true });
        form.setValue("employeeTurnoverReduction", Math.max(0, parseFloat(params.employeeTurnoverReduction.toFixed(2))), { shouldValidate: true });

        toast({
            title: "AI Suggestions Applied",
            description: "Optimal impact parameters have been filled in for you.",
        });

      } catch (error) {
        console.error("AI suggestion failed:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get AI suggestions. Please try again.",
        });
      }
    });
  };
  
  const handleReset = () => {
    form.reset(initialValues);
  }

  const InputIconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {children}
      </div>
      <style jsx>{`
        :global(.pl-10) {
          padding-left: 2.5rem !important;
        }
      `}</style>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Current Recruitment Metrics</CardTitle>
                <CardDescription>Enter your company's current hiring data.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="annualHires" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Annual Hires</FormLabel>
                    <InputIconWrapper>
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 100" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="interviewsPerHire" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interviews per Hire</FormLabel>
                    <InputIconWrapper>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="timeToHire" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. Time to Hire (days)</FormLabel>
                    <InputIconWrapper>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 45" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="costPerHire" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. Cost per Hire ($)</FormLabel>
                     <InputIconWrapper>
                      <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 5000" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="employeeTurnoverRate" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Annual Turnover Rate (%)</FormLabel>
                    <InputIconWrapper>
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 15" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="avgSalary" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avg. Annual Salary ($)</FormLabel>
                    <InputIconWrapper>
                      <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                      <FormControl>
                        <Input type="number" placeholder="e.g., 80000" {...field} className="pl-10" />
                      </FormControl>
                    </InputIconWrapper>
                    <FormMessage />
                  </FormItem>
                )}/>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="mb-4 sm:mb-0">
                        <CardTitle>Intervue.io Impact Parameters</CardTitle>
                        <CardDescription>Estimate the improvements with Intervue.io.</CardDescription>
                    </div>
                    <Button type="button" onClick={handleSuggest} disabled={isSuggesting}>
                        {isSuggesting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Lightbulb className="mr-2 h-4 w-4" />
                        )}
                        Get AI Suggestions
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="timeToHireReduction" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time to Hire Reduction (days)</FormLabel>
                      <InputIconWrapper>
                        <ArrowDown className="h-4 w-4 text-green-500" />
                        <FormControl>
                            <Input type="number" placeholder="e.g., 10" {...field} className="pl-10" />
                        </FormControl>
                      </InputIconWrapper>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="costPerHireReduction" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost per Hire Reduction ($)</FormLabel>
                       <InputIconWrapper>
                        <ArrowDown className="h-4 w-4 text-green-500" />
                        <FormControl>
                            <Input type="number" placeholder="e.g., 1000" {...field} className="pl-10" />
                        </FormControl>
                      </InputIconWrapper>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="employeeTurnoverReduction" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Turnover Reduction (%)</FormLabel>
                      <InputIconWrapper>
                        <ArrowDown className="h-4 w-4 text-green-500" />
                        <FormControl>
                            <Input type="number" placeholder="e.g., 5" {...field} className="pl-10" />
                        </FormControl>
                      </InputIconWrapper>
                      <FormMessage />
                    </FormItem>
                  )}/>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
                <Button type="button" variant="outline" onClick={handleReset}>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Reset Data
                </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="space-y-8 lg:sticky lg:top-8">
        <Card className="shadow-lg bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-foreground/80">
                <PiggyBank /> Estimated Annual Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold tracking-tight">{formatCurrency(savings.total)}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4"/>Time Savings</CardTitle>
                    <p className="text-2xl font-bold">{formatCurrency(savings.time)}</p>
                </CardHeader>
            </Card>
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CircleDollarSign className="w-4 h-4"/>Hiring Cost</CardTitle>
                    <p className="text-2xl font-bold">{formatCurrency(savings.cost)}</p>
                </CardHeader>
            </Card>
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Users className="w-4 h-4"/>Turnover</CardTitle>
                    <p className="text-2xl font-bold">{formatCurrency(savings.turnover)}</p>
                </CardHeader>
            </Card>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <SavingsChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
