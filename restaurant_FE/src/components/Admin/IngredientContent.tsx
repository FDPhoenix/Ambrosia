import { useEffect, useState } from 'react';
import styles from '../../css/AdminCss/IngredientContent.module.css';
import { FaEdit, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa';
import StatusBadge from './StatusBadge';
import { toast } from 'react-toastify';

interface Ingredient {
  _id: string;
  dishId: { _id: string; name: string };
  name: string;
  description: string;
  type?: string;
  quantity: number;
  status: 'Available' | 'Unavailable';
}

interface IngredientData {
  name: string;
  status: 'Available' | 'Unavailable';
  quantity: string;
  description: string;
  dishId: string;
  type?: string;
}

const INGREDIENT_TYPES = ['Fresh Food', 'Cooking Ingredients', 'Vegetable'] as const;
type IngredientType = typeof INGREDIENT_TYPES[number];

function IngredientContent() {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIngredientId, setEditIngredientId] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [dishes, setDishes] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState<string | null>(null);

  const [ingredientData, setIngredientData] = useState<IngredientData>({
    name: '',
    status: 'Available',
    quantity: '',
    description: '',
    dishId: '',
    type: '',
  });

  useEffect(() => {
    fetchDishes();
    fetchIngredients();
  }, []);

  const fetchDishes = async () => {
    try {
      const response = await fetch('http://localhost:3000/dishes/all?page=1&limit=10000');
      if (!response.ok) throw new Error('Failed to fetch dishes');
      const data = await response.json();
      setDishes(data.dishes || []);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setError('Failed to load dishes');
    }
  };

  const fetchIngredients = async (type?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = type
        ? `http://localhost:3000/ingredients/filter/type?type=${encodeURIComponent(type)}`
        : 'http://localhost:3000/ingredients';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch ingredients');
      const data = await response.json();
      setIngredients(data.ingredients || []);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      setError('Failed to load ingredients');
      setIngredients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setIngredientData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateIngredient = async () => {
    if (!ingredientData.dishId) {
      toast.error('Please select a dish.');
      return;
    }
    if (!ingredientData.name) {
      toast.error('Please enter an ingredient name.');
      return;
    }
    if (!ingredientData.quantity || isNaN(Number(ingredientData.quantity))) {
      toast.error('Please enter a valid quantity.');
      return;
    }

    try {
      const url = isEditing
        ? `http://localhost:3000/ingredients/update/${editIngredientId}`
        : 'http://localhost:3000/ingredients/add';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ingredientData,
          quantity: Number(ingredientData.quantity),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(isEditing ? 'Ingredient updated successfully!' : 'Ingredient added successfully!');
        setShowForm(false);
        fetchIngredients(filterType);
        resetForm();
      } else {
        toast.error(data.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error processing ingredient:', error);
      toast.error('Error processing ingredient. Please try again.');
    }
  };

  const resetForm = () => {
    setIngredientData({
      name: '',
      status: 'Available',
      quantity: '',
      description: '',
      dishId: '',
      type: '',
    });
    setIsEditing(false);
    setEditIngredientId(null);
  };

  const handleEditIngredient = (ingredient: Ingredient) => {
    setIngredientData({
      name: ingredient.name,
      status: ingredient.status,
      quantity: String(ingredient.quantity),
      description: ingredient.description || '',
      dishId: ingredient.dishId._id,
      type: ingredient.type || '',
    });
    setEditIngredientId(ingredient._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleHideIngredient = async (ingredientId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/ingredients/hide/${ingredientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        fetchIngredients(filterType);
      } else {
        toast.error(data.message || 'Failed to update ingredient status');
      }
    } catch (error) {
      console.error('Error updating ingredient status:', error);
      toast.error('Error updating ingredient status. Please try again.');
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    setFilterType(type);
    fetchIngredients(type);
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.contentContainer}>
      <div className={styles.contentTitle}>
        <h3>List of Ingredients</h3>
        <div>
          <select
            value={filterType}
            onChange={handleFilterChange}
            style={{ marginRight: '10px', padding: '5px' }}
          >
            <option value="">All Types</option>
            {INGREDIENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button onClick={() => { setShowForm(true); setIsEditing(false); }}>Add New</button>
        </div>
      </div>

      <div className={styles.mainContent}>
        {ingredients.length === 0 ? (
          <p>No ingredients found.</p>
        ) : (
          <table className={styles.dishTable}>
            <thead>
              <tr>
                <th>No</th>
                <th>Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient, index) => (
                <tr key={ingredient._id}>
                  <td>{index + 1}</td>
                  <td>{ingredient.name}</td>
                  <td>{ingredient.description || '-'}</td>
                  <td>{ingredient.quantity}</td>
                  <td>{ingredient.type || '-'}</td>
                  <td>
                    <div style={{ width: '106px', margin: '0 auto' }}>
                      <StatusBadge
                        status={ingredient.status === 'Available'}
                        caseTrue="Available"
                        caseFalse="Unavailable"
                      />
                    </div>
                  </td>
                  <td>
                    <button
                      className={styles.actionButton}
                      style={{ marginRight: '10px' }}
                      onClick={() => handleEditIngredient(ingredient)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={styles.actionButton}
                      onClick={() => handleHideIngredient(ingredient._id)}
                    >
                      {ingredient.status === 'Available' ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>{isEditing ? 'Edit Ingredient' : 'Add New Ingredient'}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }}>
                <FaTimes />
              </button>
            </div>

            <div className={styles.formContent}>
              <div className={styles.formFields}>
                <input
                  type="text"
                  name="name"
                  placeholder="Ingredient Name"
                  value={ingredientData.name}
                  onChange={handleInputChange}
                  required
                />
                <select
                  name="dishId"
                  value={ingredientData.dishId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Dish --</option>
                  {dishes.map((dish) => (
                    <option key={dish._id} value={dish._id}>
                      {dish.name}
                    </option>
                  ))}
                </select>
                <select
                  name="type"
                  value={ingredientData.type || ''}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Type --</option>
                  {INGREDIENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <input
                  className={styles.noSpinner}
                  type="number"
                  name="quantity"
                  placeholder="Quantity"
                  value={ingredientData.quantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />

                <textarea
                  className={styles.textarea}
                  name="description"
                  placeholder="Description"
                  value={ingredientData.description}
                  onChange={handleInputChange}
                />
                
                <button onClick={handleAddOrUpdateIngredient}>
                  {isEditing ? 'Update Ingredient' : 'Add Ingredient'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IngredientContent;