import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";

export default function CongratulationsPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-yellow-500 flex items-center justify-center p-4">
      <Confetti width={dimensions.width} height={dimensions.height} numberOfPieces={500} recycle={true} run={true} />
      <Card className="w-full max-w-2xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-4xl font-extrabold text-center text-purple-800">Congratulations!</CardTitle>
          <CardDescription className="text-xl text-center text-purple-600">
            You are now the proud owner of a... unique property!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <img
              src="/trashHouse.jpg?height=300&width=400"
              alt="An old, stinky house"
              className="w-full h-auto rounded-lg shadow-lg"
            />
            <motion.div
              className="absolute top-0 left-0 bg-yellow-400 text-black font-bold py-2 px-4 rounded-tl-lg rounded-br-lg"
              animate={{
                rotate: [0, -5, 5, -5, 0],
                scale: [1, 1.2, 1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              SOLD!
            </motion.div>
          </div>
          <p className="text-2xl font-bold text-center text-green-700">Price: $10,000,000</p>
          <p className="text-lg text-center text-gray-700">
            This charming fixer-upper comes with its own unique aroma and a lifetime supply of surprises!
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
            <a href="https://www.nrk.no/norge/leter-trolig-etter-blod-utenfor-hagens-hus-1.15001230">
              Start Your Adventure!
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
