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
  CardFooter,
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
    { name: "Time Savings", value: savings.time, fill: "hsl(var(--chart-1))" },
    { name: "Hiring Cost", value: savings.cost, fill: "hsl(var(--chart-2))" },
    { name: "Turnover", value: savings.turnover, fill: "hsl(var(--chart-3))" },
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

  const InputField = ({ name, label, icon, placeholder }: { name: keyof FormValues, label: string, icon: React.ReactNode, placeholder: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              {icon}
            </div>
            <FormControl>
              <Input type="number" placeholder={placeholder} {...field} className="pl-10" />
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <Form {...form}>
          <form className="space-y-8">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Current Recruitment Metrics</CardTitle>
                <CardDescription>Enter your company's current hiring data.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="annualHires" label="Total Annual Hires" icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 100" />
                <InputField name="interviewsPerHire" label="Interviews per Hire" icon={<Users className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 8" />
                <InputField name="timeToHire" label="Avg. Time to Hire (days)" icon={<Clock className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 45" />
                <InputField name="costPerHire" label="Avg. Cost per Hire ($)" icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 5000" />
                <InputField name="employeeTurnoverRate" label="Annual Turnover Rate (%)" icon={<Users className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 15" />
                <InputField name="avgSalary" label="Avg. Annual Salary ($)" icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />} placeholder="e.g., 80000" />
              </CardContent>
            </Card>

            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle>Intervue.io Impact Parameters</CardTitle>
                <CardDescription>Estimate the improvements with Intervue.io or let AI suggest them.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField name="timeToHireReduction" label="Time to Hire Reduction (days)" icon={<ArrowDown className="h-4 w-4 text-green-500" />} placeholder="e.g., 10" />
                  <InputField name="costPerHireReduction" label="Cost per Hire Reduction ($)" icon={<ArrowDown className="h-4 w-4 text-green-500" />} placeholder="e.g., 1000" />
                  <InputField name="employeeTurnoverReduction" label="Turnover Reduction (%)" icon={<ArrowDown className="h-4 w-4 text-green-500" />} placeholder="e.g., 5" />
              </CardContent>
              <CardFooter className="flex-col sm:flex-row gap-2 pt-6">
                  <Button type="button" onClick={handleSuggest} disabled={isSuggesting} className="w-full sm:w-auto">
                      {isSuggesting ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                      Get AI Suggestions
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                      <RefreshCcw />
                      Reset Data
                  </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
      <div className="space-y-6 lg:sticky lg:top-24">
        <Card className="bg-primary/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-primary">
                <PiggyBank /> Estimated Annual Savings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground">{formatCurrency(savings.total)}</p>
            <p className="text-sm text-muted-foreground mt-1">based on your inputs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Savings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium text-muted-foreground">Time</p>
                    <p className="text-lg font-bold">{formatCurrency(savings.time)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium text-muted-foreground">Hiring Cost</p>
                    <p className="text-lg font-bold">{formatCurrency(savings.cost)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm font-medium text-muted-foreground">Turnover</p>
                    <p className="text-lg font-bold">{formatCurrency(savings.turnover)}</p>
                </div>
            </div>
            <div className="pt-4">
                <SavingsChart data={chartData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
