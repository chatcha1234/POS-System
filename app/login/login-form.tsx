'use client'

import { useActionState } from 'react'
import { authenticate, authenticateGoogle } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  )

  return (
    <Card className="w-full max-w-sm mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">POS Login</CardTitle>
        <CardDescription>Enter your credentials to continue.</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" placeholder="admin" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          {errorMessage && (
            <div className="text-sm text-red-500 font-medium p-2 bg-red-50 rounded">
              {errorMessage}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </CardFooter>
      </form>
      <div className="relative px-6 pb-2">
        <div className="absolute inset-0 flex items-center px-6">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <CardFooter>
         <form
          action={async () => {
             await authenticateGoogle()
          }}
          className="w-full"
        >
          <Button variant="outline" className="w-full" type="submit">
            Sign in with Google
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
