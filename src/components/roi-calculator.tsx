"use client";

import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Briefcase,
  CircleDollarSign,
  Clock,
  RefreshCcw,
  Users,
  BadgePercent,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { RadioGroup } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import SavingsChart from "./savings-chart";

const formSchema = z.object({
  interviewsPerRole: z.coerce.number().min(1, "Must be at least 1"),
  monthlyHiringVolume: z.coerce.number().min(1, "Must be at least 1"),
  avgInterviewerSalary: z.coerce.number().min(1, "Must be a positive number"),
  salaryType: z.enum(["monthly", "hourly"]),
  avgInterviewDuration: z.coerce.number().min(0.5, "Must be at least 0.5"),
});

type FormValues = z.infer<typeof formSchema>;

const initialValues: FormValues = {
  interviewsPerRole: 5,
  monthlyHiringVolume: 10,
  avgInterviewerSalary: 100000,
  salaryType: "monthly",
  avgInterviewDuration: 1.5,
};

const WORKING_HOURS_PER_MONTH = 160;
const INTERVUE_SAVINGS_PERCENTAGE = 0.40;

export default function RoiCalculator() {
  const [showResults, setShowResults] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  });

  const watchedValues = form.watch();

  const costs = useMemo(() => {
    const {
      interviewsPerRole,
      monthlyHiringVolume,
      avgInterviewerSalary,
      salaryType,
      avgInterviewDuration,
    } = watchedValues;

    const hourlySalary =
      salaryType === "monthly"
        ? avgInterviewerSalary / WORKING_HOURS_PER_MONTH
        : avgInterviewerSalary;

    const costPerInterview = hourlySalary * avgInterviewDuration;
    const costPerRole = interviewsPerRole * costPerInterview;
    const monthlyInterviewCost = costPerRole * monthlyHiringVolume;
    const currentQuarterlyCost = monthlyInterviewCost * 3;

    const quarterlySavings = currentQuarterlyCost * INTERVUE_SAVINGS_PERCENTAGE;
    const newQuarterlyCost = currentQuarterlyCost - quarterlySavings;

    return {
      currentQuarterlyCost,
      newQuarterlyCost,
      quarterlySavings,
    };
  }, [watchedValues]);
  
  const onSubmit = () => {
    setShowResults(true);
  }

  const handleReset = () => {
    form.reset(initialValues);
    setShowResults(false);
  };

  const chartData = [
    {
      name: "Current Cost",
      value: costs.currentQuarterlyCost,
      fill: "#ef4444",
    },
    {
      name: "With Intervue.io",
      value: costs.newQuarterlyCost,
      fill: "#22c55e",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 items-start">
      <div className="md:col-span-2">
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle>Your Current Process</CardTitle>
            <CardDescription>
              Enter your current interviewing metrics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interviewsPerRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interviews / Role</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} icon={Briefcase} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyHiringVolume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Hires</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} icon={Users} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="avgInterviewDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Interview Duration (hrs)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} icon={Clock} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avgInterviewerSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avg. Interviewer Salary</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          icon={CircleDollarSign}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="salaryType"
                        render={({ field: radioField }) => (
                          <RadioGroup
                            onValueChange={radioField.onChange}
                            defaultValue={radioField.value}
                            className="grid grid-cols-2 gap-2 mt-2"
                          >
                            <FormItem>
                              <FormControl>
                                <Button
                                  size="sm"
                                  type="button"
                                  variant={
                                    radioField.value === "monthly"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => radioField.onChange("monthly")}
                                  className="w-full"
                                >
                                  Monthly
                                </Button>
                              </FormControl>
                            </FormItem>
                            <FormItem>
                              <FormControl>
                                <Button
                                  size="sm"
                                  type="button"
                                  variant={
                                    radioField.value === "hourly"
                                      ? "default"
                                      : "outline"
                                  }
                                  onClick={() => radioField.onChange("hourly")}
                                  className="w-full"
                                >
                                  Hourly
                                </Button>
                              </FormControl>
                            </FormItem>
                          </RadioGroup>
                        )}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                   <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="w-full sm:w-auto text-muted-foreground">
                    <RefreshCcw className="mr-2" />
                    Reset
                  </Button>
                  <Button type="submit" size="lg" className="w-full sm:w-auto">
                    <Calculator className="mr-2" />
                    Calculate Savings
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <div
        className={`md:col-span-3 transition-opacity duration-500 ${
          showResults ? "opacity-100" : "opacity-0"
        }`}
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Your Potential Savings</CardTitle>
            <CardDescription>
              Assuming a 40% cost reduction with Intervue.io
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Current Quarterly Cost
                    </p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(costs.currentQuarterlyCost)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-muted rounded-md mt-1">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Intervue.io Quarterly Cost
                    </p>
                    <p className="text-2xl font-bold">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(costs.newQuarterlyCost)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-100 text-green-900 p-6 rounded-xl flex flex-col justify-center items-center text-center h-full">
                <div className="p-3 bg-green-200 rounded-full mb-3">
                  <BadgePercent className="w-6 h-6 text-green-900" />
                </div>
                <h3 className="text-lg font-semibold">
                  Total Quarterly Savings
                </h3>
                <p className="text-4xl font-bold mt-1">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(costs.quarterlySavings)}
                </p>
                <p className="text-sm opacity-80 mt-1">
                  That's a 40% reduction!
                </p>
              </div>
            </div>

            <Separator />

            <div className="h-64 w-full">
              <SavingsChart data={chartData} />
            </div>

            <div className="mt-6 text-center pt-4">
              <Button asChild size="lg" className="w-full md:w-auto">
                <a
                  href="https://www.intervue.io/business-book-a-demo#form"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hire with Intervue.io
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
