import { Link } from '@tanstack/react-router'
import { ArrowLeft, Compass, Home } from 'lucide-react'
import { Button } from '@/shared/ui'

export const NotFound = () => {
  return (
    <div className="flex relative items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="relative">
          <div className="text-[12rem] md:text-[16rem] font-bold text-slate-200 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
              <Compass className="w-16 h-16 md:w-20 md:h-20 text-white animate-spin duration-[3s]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Oops! Page Not Found</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            The page you're looking for seems to have wandered off into the digital wilderness.
            Don't worry, we'll help you find your way back!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link to="." className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Go Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
          >
            <Link to="." className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </Link>
          </Button>
        </div>

        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-pink-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-12 h-12 bg-green-200 rounded-full opacity-20 animate-pulse delay-[2s]"></div>
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-purple-200 rounded-full opacity-20 animate-pulse delay-500"></div>
      </div>
    </div>
  )
}
