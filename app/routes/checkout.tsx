import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const obscureEmailEndings = ["@potato.chip", "@crispy.snack", "@salty.crunch", "@flavor.blast", "@chip.muncher"];

interface CountryCode {
  name: string;
  dial_code: string;
  code: string;
}

export default function CheckoutPage() {
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");
  const [phoneInputs, setPhoneInputs] = useState(Array(9).fill(""));
  const [email, setEmail] = useState("");
  const [randomChipCount, setRandomChipCount] = useState(0);
  const [countryCodes, setCountryCodes] = useState<CountryCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    setRandomChipCount(Math.floor(Math.random() * 50) + 1);
    fetchCountryCodes();
  }, []);

  const fetchCountryCodes = async () => {
    try {
      const response = await fetch(
        "https://gist.githubusercontent.com/anubhavshrimal/75f6183458db8c453306f93521e93d37/raw/f77e7598a8503f1f70528ae1cbf9f66755698a16/CountryCodes.json"
      );
      const data = await response.json();
      setCountryCodes(data);
    } catch (error) {
      console.error("Failed to fetch country codes:", error);
    }
  };
  const router = useNavigate();

  const handleNameChange = useCallback((value: string) => {
    const addLetter = (currentName: string, newName: string, index: number) => {
      if (index >= newName.length) return;
      setTimeout(() => {
        setName(currentName + newName[index]);
        addLetter(currentName + newName[index], newName, index + 1);
      }, 500);
    };
    addLetter("", value, 0);
  }, []);

  const handlePhoneChange = useCallback((index: number, value: string) => {
    setPhoneInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  const handleRandomPhoneDigit = useCallback(
    (index: number) => {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      handlePhoneChange(index, randomDigit);
    },
    [handlePhoneChange]
  );

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleGeolocation = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      setAddress(data.display_name);
    } catch (error) {
      console.error("Failed to fetch address:", error);
      setAddress("Correct");
    }
    setAddress("Correct");
    setIsLoading(false);
  }, [latitude, longitude]);

  const navigate = useNavigate();

  const handleSubmit = (event: any) => {
    event.preventDefault(); // Prevent the default form submission
    navigate("/complete");
  };

  return (
    <div className="container mx-auto p-4">
      <p>Time left: {formatTime(timeLeft)}</p>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <p className="mb-4">You have {randomChipCount} chip(s) in your cart.</p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => handleNameChange(e.target.value)} className="mt-1" required />
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="mt-1"
                placeholder="Enter latitude"
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="mt-1"
                placeholder="Enter longitude"
                required
              />
            </div>
          </div>
          <Button type="button" onClick={handleGeolocation} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Get Address
          </Button>
          {address && (
            <div className="mt-2">
              <Label>Address</Label>
              <p className="mt-1 p-2 bg-muted rounded text-green-400 animate-bounce">{address}</p>
            </div>
          )}
        </div>

        <div>
          <Label>Phone Number</Label>
          <div className="grid grid-cols-5 gap-2 mt-1">
            <Select onValueChange={(value) => handlePhoneChange(0, value)}>
              <SelectTrigger>
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {countryCodes.map((code, index) => (
                  <SelectItem key={index} value={code.dial_code}>
                    {code.dial_code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <div key={index} className="space-y-1">
                <Input
                  type="text"
                  maxLength={1}
                  value={phoneInputs[index]}
                  onChange={(e) => handlePhoneChange(index, e.target.value)}
                  className="w-full"
                  required
                />
                <Button type="button" onClick={() => handleRandomPhoneDigit(index)} size="sm" className="w-full">
                  Random
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="hover:animate-spin">
          <Label htmlFor="email">Email</Label>
          <div className="flex mt-1">
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow"
              placeholder="Enter email"
              required
            />
            <Select onValueChange={(value) => setEmail((prev) => prev.split("@")[0] + value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select ending" />
              </SelectTrigger>
              <SelectContent>
                {obscureEmailEndings.map((ending, index) => (
                  <SelectItem key={index} value={ending}>
                    {ending}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="hover:animate-ping">
          <Button type="submit" className="w-full">
            <div className=" animate-bounce">Complete Order</div>
          </Button>
        </div>
      </form>
    </div>
  );
}
