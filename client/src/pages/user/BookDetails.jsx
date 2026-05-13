import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bookService } from '../../services/book.service';
import { formatPrice } from '../../utils/format';
import toast from 'react-hot-toast';
import useCartStore from '../../store/cart.store';
import useAuthStore from '../../store/auth.store';
import BookReviews from '../../components/BookReviews';
import BookRow from '../../components/BookRow';
import RelatedBooks from '../../components/RelatedBooks';
const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  // State mới để chứa sách cùng chủ đề
  const [relatedBooks, setRelatedBooks] = useState([]);
  
  const addToCart = useCartStore((state) => state.addToCart);
  
  const fetchBookDetails = async () => {
    try {
      const data = await bookService.getById(id);
      setBook(data);

      // --- LOGIC MỚI: LẤY SÁCH CÙNG CHỦ ĐỀ ---
      // Lấy thể loại đầu tiên của sách hiện tại để tìm các sách liên quan
      if (data?.categories?.length > 0) {
        try {
          const categoryId = data.categories[0]._id || data.categories[0];
          const relatedData = await bookService.getAll(1, '', categoryId);
          // Lọc bỏ cuốn sách hiện tại đang xem ra khỏi danh sách liên quan
          if (relatedData?.books) {
            setRelatedBooks(relatedData.books.filter(b => b._id !== data._id));
          }
        } catch (err) {
          console.error('Không thể tải sách cùng chủ đề', err);
        }
      }
      
    } catch (error) {
      toast.error('Không tìm thấy sách này');
      navigate('/store');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookDetails();
    // Mỗi khi id thay đổi (người dùng bấm vào 1 sách liên quan), reset lại số lượng
    setQuantity(1); 
  }, [id, navigate]);

  const handleQuantityChange = (type) => {
    if (type === 'inc' && quantity < book.quantityInStock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(book, quantity);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-950"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div></div>;
  if (!book) return null;

  return (
    <div className="relative bg-white dark:bg-gray-950 min-h-screen pb-20 transition-colors duration-300">
      
      {/* =========================================
         HIỆU ỨNG VỆT MÀU THEO MÙA DƯỚI NỀN
         ========================================= */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[600px] h-[600px] rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-50 blur-[120px] transition-colors duration-700"></div>
        <div className="absolute top-[20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-blue-50 dark:bg-blue-900/10 opacity-60 blur-[100px] transition-colors duration-700"></div>
        <div className="absolute top-[60%] left-[-15%] w-[450px] h-[450px] rounded-full bg-blue-200 dark:bg-blue-800/15 opacity-50 blur-[120px] transition-colors duration-700"></div>
        <div className="absolute bottom-[5%] right-[-10%] w-[400px] h-[400px] rounded-full bg-blue-100 dark:bg-blue-800/10 opacity-40 blur-[80px] transition-colors duration-700"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        
        {/* Breadcrumb */}
        <nav className="py-6 flex items-center gap-2 text-sm tracking-widest font-semibold text-gray-500">
          <Link to="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
          <i className="ri-arrow-right-s-line"></i>
          <Link to="/store" className="hover:text-blue-600 transition-colors">Cửa hàng</Link>
          <i className="ri-arrow-right-s-line"></i>
          <span className="text-gray-900 dark:text-gray-200 truncate max-w-[200px]">{book.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* CỘT TRÁI: ẢNH */}
          <div className="lg:col-span-4 sticky top-40 flex justify-center lg:justify-start">
            <div className="relative w-full max-w-[320px] group">
              <div className="relative rounded-[0.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 bg-gray-100 dark:bg-gray-800 aspect-[3/4]">
                <img 
                  src={book.imageUrl || 'https://via.placeholder.com/600x800'} 
                  alt={book.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Nhãn dán */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  {book.isTrending && (
                    <span className="px-2.5 py-1 bg-orange-500 text-white text-[10px] font-black rounded-md uppercase tracking-wide">
                      Trending
                    </span>
                  )}
                  {book.isBestSeller && (
                    <span className="px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black rounded-md uppercase tracking-wide">
                      Best Seller
                    </span>
                  )}
                </div>
              </div>
              
              <div className="absolute -inset-2 bg-blue-600/5 dark:bg-blue-400/5 rounded-[2.5rem] -z-10 blur-xl transition-colors duration-700"></div>
            </div>
          </div>

          {/* CỘT PHẢI: NỘI DUNG */}
          <div className="lg:col-span-8 space-y-10">
            
            <section className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  {book.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-base">
                  <Link to={`/author/${book.author?._id}`} className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center">
                    <i className="ri-quill-pen-line mr-2"></i> {book.author?.name || 'Tác giả ẩn danh'}
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="flex text-yellow-400 text-lg">
                      <i className="ri-star-fill"></i>
                    </div>
                    <span className="text-gray-900 dark:text-gray-100 font-black">{book.rating || '0.0'}</span>
                    <span className="text-gray-500 font-medium">({book.numReviews} nhận xét)</span>
                  </div>
                </div>
              </div>

              {/* Giá */}
              <div className="flex items-end gap-4 py-2">
                <div className="px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl transition-colors duration-300">
                  <span className="text-4xl font-black text-blue-600 dark:text-blue-400 transition-colors duration-300">
                    {formatPrice(book.sale_price > 0 ? book.sale_price : book.price)}
                  </span>
                </div>
                {book.sale_price > 0 && (
                  <span className="text-xl text-gray-400 line-through font-medium pb-1">
                    {formatPrice(book.price)}
                  </span>
                )}
              </div>

              {/* Mô tả */}
              <div className="p-6 bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed italic">
                  "{book.description || "Một tác phẩm đầy lôi cuốn, mang lại những giá trị tri thức sâu sắc và trải nghiệm đọc tuyệt vời cho mọi độc giả."}"
                </p>
              </div>

              {/* Kho hàng & Thể loại */}
              <div className="grid grid-cols-2 gap-8 py-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-xl">
                    <i className="ri-archive-line"></i>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wide mb-0.5">Kho hàng</p>
                    <p className={`text-sm font-bold ${book.quantityInStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {book.quantityInStock > 0 ? `Còn ${book.quantityInStock} cuốn` : 'Hết hàng'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-xl">
                    <i className="ri-price-tag-3-line"></i>
                  </div>
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-400 tracking-wide mb-0.5">Thể loại</p>
                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                      {book.categories.map(c => c.name).join(', ')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              {book.quantityInStock > 0 && (
                <div className="flex items-center gap-5 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5">
                    <button onClick={() => handleQuantityChange('dec')} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors text-lg">
                      <i className="ri-subtract-line"></i>
                    </button>
                    <span className="w-10 text-center font-black text-base text-gray-900 dark:text-white">{quantity}</span>
                    <button onClick={() => handleQuantityChange('inc')} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 transition-colors text-lg">
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <i className="ri-shopping-cart-2-fill text-xl"></i>
                    Thêm vào giỏ hàng
                  </button>
                </div>
              )}
            </section>

            {/* Review Section */}
            <div className="pt-8 relative z-20">
               <BookReviews 
                book={book} 
                user={user} 
                isAuthenticated={isAuthenticated} 
                onReviewSuccess={fetchBookDetails} 
              />
            </div>
          </div>
        </div>
      </div>

     {/* =========================================
    HÀNG SÁCH CÙNG CHỦ ĐỀ (Dùng Component mới)
    ========================================= */}
    <section className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-800 pl-8 sm:pl-12 lg:pl-16">
    <div className="relative">
      {/* Hiệu ứng vệt màu nền mờ nhẹ để làm nổi bật hàng sách */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full h-full bg-blue-50/30 dark:bg-blue-600/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      
      <RelatedBooks 
        title="Có thể bạn cũng thích" 
        books={relatedBooks} 
      />
    </div>
  </section>

    </div>
  );
};

export default BookDetails;