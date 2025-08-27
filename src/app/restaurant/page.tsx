"use client";

import { Header } from "@/components/Header";
import { RestaurantProfile } from "@/components/RestaurantProfile";

export default function RestaurantPage() { return ( <div className="min-h-screen bg-background"> <Header /> <main> <RestaurantProfile /> </main> </div> );
}