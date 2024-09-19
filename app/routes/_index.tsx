import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "@remix-run/react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";

interface Chip {
  id: number;
  name: string;
  price: number;
  description: string;
  img: string;
}

interface CartItem extends Chip {
  quantity: number;
}

const chips: Chip[] = [
  { id: 1, name: "Classic Salt", price: 2.99, description: "The timeless favorite", img: "/havsalt.jpg" },
  { id: 2, name: "Sour Cream & Onion", price: 3.49, description: "Tangy and savory", img: "/paprika.jpg" },
  { id: 3, name: "BBQ", price: 3.49, description: "Sweet and smoky", img: "/parmesan.jpg" },
  { id: 4, name: "Jalapeño", price: 3.99, description: "Spicy kick", img: "/havsalt.jpg" },
];

const blinkColors = ["#FFFFFF", "#000000"];

export default function PotatoChipStore() {
  const router = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastAddedChip, setLastAddedChip] = useState<Chip | null>(null);
  const [backgroundColor, setBackgroundColor] = useState("");
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [checkoutInput, setCheckoutInput] = useState("");

  const getRandomQuantity = useCallback(() => Math.floor(Math.random() * 11), []);

  const updateCartInURL = useCallback(
    (newCart: CartItem[]) => {
      const encodedCart = encodeURIComponent(JSON.stringify(newCart));
      router(`?cart=${encodedCart}`);
    },
    [router]
  );

  const addToCart = useCallback(
    (chip: Chip) => {
      const quantityToAdd = getRandomQuantity();
      setCart((currentCart) => {
        const newCart = currentCart.find((item) => item.id === chip.id)
          ? currentCart.map((item) =>
              item.id === chip.id ? { ...item, quantity: item.quantity + quantityToAdd } : item
            )
          : [...currentCart, { ...chip, quantity: quantityToAdd }];
        updateCartInURL(newCart);
        return newCart;
      });
      setLastAddedChip(chip);

      setTimeout(() => {
        setDialogOpen(true);
      }, 1000);
    },
    [getRandomQuantity, updateCartInURL]
  );

  const removeFromCart = useCallback(
    (chipId: number) => {
      const quantityToRemove = getRandomQuantity();
      setCart((currentCart) => {
        const newCart = currentCart.reduce((acc, item) => {
          if (item.id === chipId) {
            const newQuantity = Math.max(0, item.quantity - quantityToRemove);
            return newQuantity > 0 ? [...acc, { ...item, quantity: newQuantity }] : acc;
          }
          return [...acc, item];
        }, [] as CartItem[]);
        updateCartInURL(newCart);
        return newCart;
      });
    },
    [getRandomQuantity, updateCartInURL]
  );

  useEffect(() => {
    if (dialogOpen) {
      const timeout = setTimeout(() => {
        setDialogOpen(false);
      }, Math.floor(Math.random() * 4000) + 1000);
      return () => clearTimeout(timeout);
    }
  }, [dialogOpen]);

  useEffect(() => {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems >= 2) {
      const blinkInterval = setInterval(() => {
        const randomColor = blinkColors[Math.floor(Math.random() * blinkColors.length)];
        setBackgroundColor(randomColor);
      }, 100);

      return () => clearInterval(blinkInterval);
    } else {
      setBackgroundColor("");
    }
  }, [cart]);

  useEffect(() => {
    document.body.style.backgroundColor = backgroundColor;
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, [backgroundColor]);

  const handleButtonHover = useCallback(() => {
    const x = Math.random() * 200 - 5;
    const y = Math.random() * 200 - 5;
    setButtonPosition({ x, y });
  }, []);

  const handleButtonClick = useCallback(
    (chip: Chip) => {
      const x = Math.random() * 200 - 20;
      const y = Math.random() * 200 - 20;
      setButtonPosition({ x, y });
      addToCart(chip);
    },
    [addToCart]
  );

  const handleCheckoutInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCheckoutInput(e.target.value);
    if (e.target.value.toLowerCase() === "a4hpw8") {
      router("/checkout?" + "cart=" + encodeURIComponent(JSON.stringify(cart)));
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft === 0) return; // Exit when timer hits 0

    // Create an interval to count down every second
    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    // Cleanup the interval when the component unmounts or when timeLeft changes
    return () => clearInterval(timerId);
  }, [timeLeft]);

  // Format the time as MM:SS
  const formatTime = (time: any) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Single Chip Store</h1>
        <div>
          <h1>Tid</h1>
          <div style={{ fontSize: "48px", fontWeight: "bold" }}>{formatTime(timeLeft)}</div>
        </div>
        <div className="flex items-center">
          <ShoppingCart className="mr-2" />
          <Badge variant="secondary">{totalItems}</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {chips.map((chip) => (
          <Card key={chip.id}>
            <CardHeader>
              <CardTitle>{chip.name}</CardTitle>
              <CardDescription>{chip.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${chip.price.toFixed(2)}</p>
              <img src={chip.img} height={200} className="h-52" />
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleButtonClick(chip)}
                onMouseEnter={handleButtonHover}
                style={{
                  transform: `translate(${buttonPosition.x}px, ${buttonPosition.y}px)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                Add to Cart
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <span>{item.name}</span>
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={() => removeFromCart(item.id)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => addToCart(item)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="ml-4">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <strong>Total: ${totalPrice.toFixed(2)}</strong>
            </div>
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Type 'a4hpw8' to proceed"
                value={checkoutInput}
                onChange={handleCheckoutInputChange}
              />
            </div>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Added to Cart</DialogTitle>
            <DialogDescription>{lastAddedChip && `You've added ${lastAddedChip.name} to your cart.`}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
