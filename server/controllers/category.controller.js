import Category from '../models/Category.js';
import { logAction } from './audit.controller.js';

// @desc    Lấy tất cả danh mục
// @route   GET /api/v1/categories
// @access  Public
export const getAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Lấy chi tiết 1 danh mục
// @route   GET /api/v1/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy danh mục');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Thêm mới danh mục
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, bannerUrl } = req.body;
    
    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      res.status(400);
      throw new Error('Tên danh mục đã tồn tại');
    }

    const category = await Category.create({ name, description, bannerUrl });
    
    // GHI LOG THÊM DANH MỤC
    await logAction(
      req.user._id, 
      'THÊM', 
      'Danh Mục', 
      `Đã tạo danh mục mới: "${category.name}"`
    );
    
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// @desc    Cập nhật danh mục
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
  try {
    const { name, description, bannerUrl } = req.body;
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = name || category.name;
      category.description = description || category.description;
      category.bannerUrl = bannerUrl || category.bannerUrl;

      const updatedCategory = await category.save();

      // GHI LOG CẬP NHẬT DANH MỤC
      await logAction(
        req.user._id, 
        'SỬA', 
        'Danh Mục', 
        `Đã cập nhật thông tin danh mục: "${updatedCategory.name}"`
      );

      res.json(updatedCategory);
    } else {
      res.status(404);
      throw new Error('Không tìm thấy danh mục');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Xóa danh mục
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      await Category.deleteOne({ _id: category._id });

      // GHI LOG XÓA DANH MỤC
      await logAction(
        req.user._id, 
        'XÓA', 
        'Danh Mục', 
        `Đã xóa danh mục: "${category.name}"`
      );

      res.json({ message: 'Đã xóa danh mục thành công' });
    } else {
      res.status(404);
      throw new Error('Không tìm thấy danh mục');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Bật/Tắt trạng thái danh mục
// @route   PUT /api/v1/categories/:id/status
// @access  Private/Admin
export const toggleCategoryStatus = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404);
      throw new Error('Không tìm thấy danh mục');
    }
    
    // Nếu danh mục cũ chưa có trường isActive (bị undefined) thì mặc định gán là false (vì đang ấn toggle để tắt)
    category.isActive = category.isActive === undefined ? false : !category.isActive; 
    
    await category.save();

    // GHI LOG ĐỔI TRẠNG THÁI DANH MỤC
    await logAction(
      req.user._id, 
      'SỬA', 
      'Danh Mục', 
      `Đã ${category.isActive ? 'bật' : 'tắt'} trạng thái hiển thị của danh mục: "${category.name}"`
    );

    res.json({ message: `Đã ${category.isActive ? 'bật' : 'tắt'} danh mục` });
  } catch (error) {
    next(error);
  }
};