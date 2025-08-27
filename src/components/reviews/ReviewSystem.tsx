
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";
import { Star, StarHalf, Camera, Upload, X, ThumbsUp, MessageCircle, Verified, Filter, SortDesc, Plus } from "lucide-react";
import { toast } from "../../hooks/use-toast";

interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId?: string;
  orderId?: string;
  rating: number;
  title?: string;
  comment: string;
  photos: string[];
  isVerified: boolean;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  helpfulCount?: number;
}

interface ReviewSystemProps {
  productId: string;
  productName: string;
  orderId?: string;
  showAddReview?: boolean;
  showOnlyForm?: boolean;
  className?: string;
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = "md" 
}: { 
  rating: number; 
  onRatingChange?: (rating: number) => void; 
  readonly?: boolean; 
  size?: "sm" | "md" | "lg";
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const sizeClasses = { sm: "h-4 w-4", md: "h-5 w-5", lg: "h-6 w-6" };
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        const isHalf = !isFilled && (hoverRating || rating) >= star - 0.5;
        
        return (
          <button
            key={star}
            type="button"
            className={`${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            onClick={() => !readonly && onRatingChange?.(star)}
          >
            {isFilled ? (
              <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
            ) : isHalf ? (
              <StarHalf className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
            ) : (
              <Star className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

const PhotoUpload = ({ 
  photos, 
  onPhotosChange, 
  maxPhotos = 5 
}: { 
  photos: string[]; 
  onPhotosChange: (photos: string[]) => void; 
  maxPhotos?: number;
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (photos.length + files.length > maxPhotos) {
      toast({
        title: "Limite atteinte",
        description: `Vous ne pouvez ajouter que ${maxPhotos} photos maximum.`,
        variant: "destructive"
      });
      return;
    }
    
    // Convert files to base64 URLs (in real app, upload to server)
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onPhotosChange([...photos, result]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };
  
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <Image
              src={photo}
              alt={`Photo ${index + 1}`}
              width={100}
              height={100}
              className="rounded-lg object-cover w-full h-20"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        {photos.length < maxPhotos && (
          <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-20 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
            <Camera className="h-5 w-5 text-gray-400 mb-1" />
            <span className="text-xs text-gray-500">Ajouter</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      <p className="text-xs text-gray-500">
        {photos.length}/{maxPhotos} photos • Formats acceptés: JPG, PNG, WebP
      </p>
    </div>
  );
};

interface AddReviewFormProps {
  productId?: string;
  orderId?: string;
  onReviewAdded: () => void;
  onCancel?: () => void;
  embedded?: boolean;
}

const AddReviewForm = ({ 
  productId, 
  orderId, 
  onReviewAdded, 
  onCancel, 
  embedded = false 
}: AddReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Note requise",
        description: "Veuillez donner une note avant de publier votre avis.",
        variant: "destructive"
      });
      return;
    }
    
    if (comment.trim().length < 10) {
      toast({
        title: "Commentaire trop court",
        description: "Votre commentaire doit contenir au moins 10 caractères.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Avis publié !",
        description: "Merci pour votre retour. Votre avis sera visible après modération."
      });
      
      // Reset form
      setRating(0);
      setTitle("");
      setComment("");
      setPhotos([]);
      
      onReviewAdded();
      onCancel?.();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la publication de votre avis.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-base font-medium">Votre note *</Label>
        <div className="mt-2">
          <StarRating rating={rating} onRatingChange={setRating} size="lg" />
        </div>
      </div>
      
      <div>
        <Label htmlFor="title">Titre de votre avis (optionnel)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Résumez votre expérience..."
          maxLength={100}
        />
      </div>
      
      <div>
        <Label htmlFor="comment">Votre commentaire *</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience avec ce produit..."
          rows={4}
          maxLength={1000}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/1000 caractères
        </p>
      </div>
      
      <div>
        <Label>Photos (optionnel)</Label>
        <div className="mt-2">
          <PhotoUpload photos={photos} onPhotosChange={setPhotos} />
        </div>
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? "Publication..." : "Publier l'avis"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
  
  if (embedded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Laisser un avis
          </CardTitle>
          <CardDescription>
            Partagez votre expérience pour aider les autres clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formContent}
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Écrire un avis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Laisser un avis</DialogTitle>
          <DialogDescription>
            Partagez votre expérience pour aider les autres clients
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  const [isHelpful, setIsHelpful] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.userAvatar} />
              <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium">{review.userName}</p>
                {review.isVerified && (
                  <Badge variant="secondary" className="text-xs">
                    <Verified className="h-3 w-3 mr-1" />
                    Achat vérifié
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} readonly size="sm" />
                <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
        {review.title && (
          <CardTitle className="text-lg mt-3">{review.title}</CardTitle>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        
        {review.photos.length > 0 && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {review.photos.slice(0, showAllPhotos ? review.photos.length : 3).map((photo, index) => (
                <Image
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1} de l'avis`}
                  width={150}
                  height={150}
                  className="rounded-lg object-cover w-full h-24 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => {/* Open lightbox */}}
                />
              ))}
            </div>
            {review.photos.length > 3 && !showAllPhotos && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAllPhotos(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Voir les {review.photos.length - 3} autres photos
              </Button>
            )}
          </div>
        )}
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsHelpful(!isHelpful)}
            className={`${isHelpful ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
          >
            <ThumbsUp className={`h-4 w-4 mr-2 ${isHelpful ? 'fill-current' : ''}`} />
            Utile ({(review.helpfulCount || 0) + (isHelpful ? 1 : 0)})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const ReviewSystem = ({ 
  productId, 
  productName, 
  orderId, 
  showAddReview = true, 
  showOnlyForm = false, 
  className 
}: ReviewSystemProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'oldest' | 'rating' | 'helpful'>('recent');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Mock data - replace with real API calls
  const mockReviews: Review[] = [
    {
      id: "1",
      userId: "user1",
      userName: "Marie Dubois",
      userAvatar: "/images/avatar1.jpg",
      productId: productId,
      rating: 5,
      title: "Pizza exceptionnelle !",
      comment: "J'ai commandé la Margherita Royale et c'était absolument délicieux. La pâte était parfaite, croustillante à l'extérieur et moelleuse à l'intérieur. Les ingrédients étaient frais et de qualité. Je recommande vivement !",
      photos: ["/images/pizza-review1.jpg", "/images/pizza-review2.jpg"],
      isVerified: true,
      isVisible: true,
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      helpfulCount: 12
    },
    {
      id: "2",
      userId: "user2",
      userName: "Pierre Martin",
      rating: 4,
      comment: "Très bonne pizza, livraison rapide. Le seul petit bémol c'est que j'aurais aimé un peu plus de garniture, mais dans l'ensemble très satisfait de ma commande.",
      photos: [],
      isVerified: true,
      isVisible: true,
      createdAt: "2024-01-14T18:45:00Z",
      updatedAt: "2024-01-14T18:45:00Z",
      helpfulCount: 8
    },
    {
      id: "3",
      userId: "user3",
      userName: "Sophie Laurent",
      rating: 5,
      title: "Service impeccable",
      comment: "Commande passée en ligne très facilement, pizza prête à l'heure prévue. L'équipe est très accueillante et professionnelle. La pizza 4 fromages était un délice !",
      photos: ["/images/pizza-review3.jpg"],
      isVerified: false,
      isVisible: true,
      createdAt: "2024-01-13T20:15:00Z",
      updatedAt: "2024-01-13T20:15:00Z",
      helpfulCount: 5
    }
  ];
  
  useEffect(() => {
    // Simulate API call
    const loadReviews = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setReviews(mockReviews);
      setLoading(false);
    };
    
    loadReviews();
  }, [productId, orderId]);
  
  const filteredAndSortedReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'helpful':
          return (b.helpfulCount || 0) - (a.helpfulCount || 0);
        case 'recent':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100 
      : 0
  }));
  
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Section - masqué si showOnlyForm */}
      {!showOnlyForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Avis clients ({reviews.length})</span>
              <div className="flex items-center gap-2">
                <StarRating rating={averageRating} readonly />
                <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <div className="space-y-2">
                <h4 className="font-medium mb-3">Répartition des notes</h4>
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm w-8">{rating} ★</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }} 
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8">{count}</span>
                  </div>
                ))}
              </div>
              
              {/* Add Review Button */}
              {showAddReview && !showOnlyForm && (
                <div className="flex flex-col justify-center">
                  <AddReviewForm
                    productId={productId}
                    orderId={orderId}
                    onReviewAdded={() => {
                      // Refresh reviews
                      setReviews([...mockReviews]);
                    }}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Filters and Sorting - masqués si showOnlyForm */}
      {!showOnlyForm && (
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2 items-center">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filtrer:</span>
            <Button
              variant={filterRating === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterRating(null)}
            >
              Tous
            </Button>
            {[5, 4, 3, 2, 1].map(rating => (
              <Button
                key={rating}
                variant={filterRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating(rating)}
              >
                {rating} ★
              </Button>
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <SortDesc className="h-4 w-4" />
            <span className="text-sm font-medium">Trier:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="recent">Plus récents</option>
              <option value="rating">Meilleures notes</option>
              <option value="helpful">Plus utiles</option>
            </select>
          </div>
        </div>
      )}
      
      {/* Reviews List - masquée si showOnlyForm */}
      {!showOnlyForm && (
        <div className="space-y-4">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map(review => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun avis pour le moment</h3>
              <p className="text-gray-600 mb-4">Soyez le premier à laisser un avis !</p>
              {showAddReview && (
                <AddReviewForm
                  productId={productId}
                  orderId={orderId}
                  onReviewAdded={() => setReviews([...mockReviews])}
                />
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSystem;