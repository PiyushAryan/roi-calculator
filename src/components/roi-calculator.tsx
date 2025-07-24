"use client";

import { useState, useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Briefcase,
  Calendar,
  CircleDollarSign,
  Clock,
  Lightbulb,
  Loader2,
  PiggyBank,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
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

  const InputField = ({ name, label, icon: Icon }: { name: keyof FormValues, label: string, icon: React.ElementType }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            {label}
          </FormLabel>
          <FormControl>
            <Input type="number" {...field} className="bg-background" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );


  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
      <div className="lg:col-span-3 space-y-10">
        <Form {...form}>
          <form className="space-y-10">
            <div>
              <h2 className="text-xl font-semibold mb-1">Current Recruitment Metrics</h2>
              <p className="text-muted-foreground mb-6">Enter your company's current hiring data.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <InputField name="annualHires" label="Total Annual Hires" icon={Users} />
                <InputField name="interviewsPerHire" label="Interviews per Hire" icon={Briefcase}/>
                <InputField name="timeToHire" label="Avg. Time to Hire (days)" icon={Clock} />
                <InputField name="costPerHire" label="Avg. Cost per Hire ($)" icon={CircleDollarSign} />
                <InputField name="employeeTurnoverRate" label="Annual Turnover Rate (%)" icon={TrendingDown} />
                <InputField name="avgSalary" label="Avg. Annual Salary ($)" icon={CircleDollarSign} />
              </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold mb-1">Intervue.io Impact Parameters</h2>
                <p className="text-muted-foreground mb-6">Estimate the improvements with Intervue.io or let AI suggest them.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <InputField name="timeToHireReduction" label="Time to Hire Reduction (days)" icon={TrendingUp} />
                  <InputField name="costPerHireReduction" label="Cost per Hire Reduction ($)" icon={TrendingUp} />
                  <InputField name="employeeTurnoverReduction" label="Turnover Reduction (%)" icon={TrendingUp} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-6">
                  <Button type="button" onClick={handleSuggest} disabled={isSuggesting} className="w-full sm:w-auto">
                      {isSuggesting ? <Loader2 className="animate-spin" /> : <Lightbulb />}
                      Get AI Suggestions
                  </Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="w-full sm:w-auto">
                      <RefreshCcw />
                      Reset Data
                  </Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-16">
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
              <PiggyBank className="text-muted-foreground" /> Estimated Annual Savings
          </h3>
          <p className="text-5xl font-bold tracking-tight text-foreground mt-2">{formatCurrency(savings.total)}</p>
          <p className="text-sm text-muted-foreground mt-1">based on your inputs</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Savings Breakdown</h3>
            <div className="pt-4">
                <SavingsChart data={chartData} />
            </div>
             <div className="grid grid-cols-3 gap-2 text-center mt-4">
                <div className="rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><Clock className="size-4" />Time</p>
                    <p className="text-xl font-bold">{formatCurrency(savings.time)}</p>
                </div>
                <div className="rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><CircleDollarSign className="size-4" />Hiring Cost</p>
                    <p className="text-xl font-bold">{formatCurrency(savings.cost)}</p>
                </div>
                <div className="rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingDown className="size-4" />Turnover</p>
                    <p className="text-xl font-bold">{formatCurrency(savings.turnover)}</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
