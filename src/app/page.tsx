import RoiCalculator from '@/components/roi-calculator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PiggyBank } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <PiggyBank className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              ROI Optimizer
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:px-6 md:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-8">
            <h2 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Calculate Your Recruitment ROI
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-lg text-muted-foreground">
              Discover your potential savings and efficiency gains with Intervue.io.
            </p>
          </div>
          
          <Card className="border-0 shadow-none">
            <CardContent className="p-0 sm:p-6">
              <RoiCalculator />
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ROI Optimizer. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
