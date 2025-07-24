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
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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

    if (!form.formState.isValid) {
      return { currentQuarterlyCost: 0, newQuarterlyCost: 0, quarterlySavings: 0 };
    }

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
  }, [watchedValues, form.formState.isValid]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const handleReset = () => {
    form.reset(initialValues);
  }

  const chartData = [
    { name: "Current Cost", value: costs.currentQuarterlyCost, fill: "var(--color-chart-1)" },
    { name: "With Intervue.io", value: costs.newQuarterlyCost, fill: "var(--color-chart-2)" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
      <div className="lg:col-span-2">
        <Card className="bg-muted/30 border-dashed">
          <CardHeader>
            <CardTitle>Your Current Process</CardTitle>
            <CardDescription>Enter your current interviewing metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="interviewsPerRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interviews / Role</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} icon={Briefcase}/>
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
                                <Input type="number" {...field} icon={CircleDollarSign} />
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
                                                <Button size="sm" type="button" variant={radioField.value === 'monthly' ? 'default' : 'outline'} onClick={() => radioField.onChange('monthly')} className="w-full">Monthly</Button>
                                            </FormControl>
                                        </FormItem>
                                        <FormItem>
                                              <FormControl>
                                                <Button size="sm" type="button" variant={radioField.value === 'hourly' ? 'default' : 'outline'} onClick={() => radioField.onChange('hourly')} className="w-full">Hourly</Button>
                                            </FormControl>
                                        </FormItem>
                                    </RadioGroup>
                                )}
                            />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="w-full md:w-auto text-muted-foreground">
                    <RefreshCcw className="mr-2" />
                    Reset Calculator
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="lg:col-span-3">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Your Potential Savings</CardTitle>
                <CardDescription>
                  <BadgePercent className="inline-block mr-2 text-green-500" />
                  Assuming a 40% cost reduction with Intervue.io
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="h-64 w-full">
                  <SavingsChart data={chartData} />
                </div>
                
                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingDown className="text-destructive"/>Current Cost</h3>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(costs.currentQuarterlyCost)}</p>
                    <p className="text-xs text-muted-foreground">per quarter</p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center justify-center gap-2"><TrendingUp className="text-green-500" />Intervue.io Cost</h3>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(costs.newQuarterlyCost)}</p>
                    <p className="text-xs text-muted-foreground">per quarter</p>
                  </div>
                   <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <h3 className="text-sm font-medium text-primary flex items-center justify-center gap-2"><BadgePercent/>Quarterly Savings</h3>
                    <p className="text-2xl font-bold mt-1 text-primary">{formatCurrency(costs.quarterlySavings)}</p>
                    <p className="text-xs text-primary/80">That's 40%!</p>
                  </div>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
