"use client";

import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Briefcase,
  Calendar,
  CircleDollarSign,
  Clock,
  RefreshCcw,
  TrendingDown,
  Users,
  CheckSquare,
  BadgePercent,
  Calculator,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

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

    if (!interviewsPerRole || !monthlyHiringVolume || !avgInterviewerSalary || !avgInterviewDuration) {
      return { costPerInterview: 0, costPerRole: 0, quarterlyTotal: 0, savingsPerQuarter: 0 };
    }

    const hourlySalary =
      salaryType === "monthly"
        ? avgInterviewerSalary / WORKING_HOURS_PER_MONTH
        : avgInterviewerSalary;

    const costPerInterview = hourlySalary * avgInterviewDuration;
    const costPerRole = interviewsPerRole * costPerInterview;
    const monthlyInterviewCost = costPerRole * monthlyHiringVolume;
    const quarterlyTotal = monthlyInterviewCost * 3;
    const savingsPerQuarter = quarterlyTotal * INTERVUE_SAVINGS_PERCENTAGE;

    return {
      costPerInterview,
      costPerRole,
      quarterlyTotal,
      savingsPerQuarter,
    };
  }, [watchedValues]);

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

  const InputField = ({ name, label, icon: Icon, unit }: { name: keyof FormValues, label: string, icon: React.ElementType, unit?: string }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
            <Icon className="size-4" />
            {label}
          </FormLabel>
          <FormControl>
            <Input type="number" {...field} className="bg-background !mt-1" unit={unit} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-none shadow-none bg-transparent">
        <Form {...form}>
          <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField name="interviewsPerRole" label="Interviews per Role" icon={Briefcase}/>
                <InputField name="monthlyHiringVolume" label="Monthly Hiring Volume" icon={Users} unit="roles" />
                <InputField name="avgInterviewDuration" label="Avg. Interview Duration" icon={Clock} unit="hours" />
                <FormField
                    control={form.control}
                    name="avgInterviewerSalary"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 font-normal text-muted-foreground">
                                <CircleDollarSign className="size-4" />
                                Average Interviewer Salary
                            </FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-2 !mt-1">
                                    <Input type="number" {...field} className="bg-background" />
                                    <FormField
                                        control={form.control}
                                        name="salaryType"
                                        render={({ field }) => (
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                                className="flex"
                                            >
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                    <FormControl>
                                                        <Button size="sm" type="button" variant={field.value === 'monthly' ? 'default' : 'outline'} onClick={() => field.onChange('monthly')} className="h-10">Monthly</Button>
                                                    </FormControl>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2 space-y-0">
                                                     <FormControl>
                                                        <Button size="sm" type="button" variant={field.value === 'hourly' ? 'default' : 'outline'} onClick={() => field.onChange('hourly')} className="h-10">Hourly</Button>
                                                    </FormControl>
                                                </FormItem>
                                            </RadioGroup>
                                        )}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <Button type="button" variant="outline" onClick={handleReset}>
                  <RefreshCcw />
                  Reset
              </Button>
          </form>
        </Form>
        </Card>
      
        <Card className="bg-muted/30 border-dashed sticky top-16">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <Calculator className="size-5" />
                    Cost & Savings Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><TrendingDown className="text-destructive" /> Current Interviewing Cost</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 text-center">
                        <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-muted-foreground">Per Interview</p>
                            <p className="text-2xl font-bold">{formatCurrency(costs.costPerInterview)}</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-muted-foreground">Per Role</p>
                            <p className="text-2xl font-bold">{formatCurrency(costs.costPerRole)}</p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-3">
                            <p className="text-sm font-medium text-muted-foreground">Quarterly Total</p>
                            <p className="text-2xl font-bold">{formatCurrency(costs.quarterlyTotal)}</p>
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h3 className="font-semibold flex items-center gap-2 text-muted-foreground"><CheckSquare className="text-green-500"/> With Intervue.io</h3>
                    <div className="mt-3 bg-background/50 rounded-lg p-4">
                        <p className="flex items-center gap-2 text-muted-foreground"><BadgePercent className="text-primary"/>40% Reduction via Automated + Expert Interviews</p>
                        <p className="mt-2">
                            <span className="font-semibold text-lg">You Could Save: </span>
                            <span className="text-3xl font-bold text-primary">{formatCurrency(costs.savingsPerQuarter)}</span>
                            <span className="text-muted-foreground"> per quarter</span>
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
