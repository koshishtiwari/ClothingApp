import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Plus, X, User, ChevronLeft, Trash2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";


const ClothingItem = ({ id, type, image, position, size, onDragStart, onDrag, onDragEnd, onResize, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const itemRef = useRef(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0 });

  const getClientCoords = (e) => {
    if (e.type.includes('mouse')) {
      return { x: e.clientX, y: e.clientY };
    }
    if (e.type.includes('touch')) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: 0, y: 0 };
  };

  const handleStart = (e) => {
    const { x, y } = getClientCoords(e);
    if (e.target === itemRef.current) {
      setIsDragging(true);
      dragStart.current = { x: x - position.x, y: y - position.y };
      onDragStart();
    } else if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      resizeStart.current = { 
        width: size.width, 
        height: size.height,
        x,
        y
      };
    }
  };

  const handleMove = (e) => {
    const { x, y } = getClientCoords(e);
    if (isDragging) {
      const newX = x - dragStart.current.x;
      const newY = y - dragStart.current.y;
      onDrag(id, { x: newX, y: newY });
    }
    if (isResizing) {
      const newWidth = resizeStart.current.width + (x - resizeStart.current.x);
      const newHeight = resizeStart.current.height + (y - resizeStart.current.y);
      onResize(id, { width: Math.max(50, newWidth), height: Math.max(50, newHeight) });
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
    onDragEnd();
  };

  useEffect(() => {
    const handleGlobalMove = (e) => {
      if (isDragging || isResizing) {
        handleMove(e);
      }
    };

    const handleGlobalEnd = () => {
      handleEnd();
    };

    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMove);
      window.removeEventListener('touchmove', handleGlobalMove);
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [isDragging, isResizing]);

  return (
    <motion.div
      ref={itemRef}
      className="absolute rounded-lg overflow-hidden shadow-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img src={image} alt={type} className="w-full h-full object-cover pointer-events-none" />
      {(showControls || isResizing) && (
        <div
          className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 opacity-50 cursor-se-resize resize-handle"
          onMouseDown={handleStart}
          onTouchStart={handleStart}
        />
      )}
      {showControls && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(id);
          }}
        >
          <X size={16} />
        </motion.button>
      )}
    </motion.div>
  );
};

const AddItemDialog = ({ onAddItem }) => {
  const [image, setImage] = useState(null);
  const [itemType, setItemType] = useState('');

  const handleCapture = () => {
    // Simulated image capture
    const simulatedImage = '/api/placeholder/200/200';
    setImage(simulatedImage);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (image && itemType) {
      onAddItem({ type: itemType, image });
      setImage(null);
      setItemType('');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white transition-colors">
          <Plus size={24} className="mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white rounded-lg p-0">
        <DialogHeader className="bg-gray-100 p-4 rounded-t-lg">
          <DialogTitle className="text-2xl font-bold">Add New Item</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          {!image ? (
            <>
              {/* <Button onClick={handleCapture} className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                <Camera size={24} className="mr-2" />
                Capture Image
              </Button> */}
              <label className="cursor-pointer">
                <Input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                  <Upload size={24} className="mr-2" />
                  <span>Upload Image</span>
                </div>
              </label>
            </>
          ) : (
            <>
              <img src={image} alt="Selected item" className="w-32 h-32 object-contain mx-auto rounded-lg" />
              <select
                value={itemType}
                onChange={(e) => setItemType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select item type</option>
                <option value="shirt">Shirt</option>
                <option value="pants">Pants</option>
                <option value="shoes">Shoes</option>
              </select>
              <Button onClick={handleAddItem} disabled={!itemType} className="w-full bg-blue-500 hover:bg-blue-600 text-white transition-colors">Add Item</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CompartmentContent = ({ items, onAddItem, onUpdateItems, onDeleteItem, onDeleteCompartment }) => {
  const handleDragStart = () => {
    // You can add any logic needed when drag starts
  };

  const handleDrag = (id, newPosition) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, position: newPosition } : item
    );
    onUpdateItems(updatedItems);
  };

  const handleDragEnd = () => {
    // You can add any logic needed when drag ends
  };

  const handleResize = (id, newSize) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, size: newSize } : item
    );
    onUpdateItems(updatedItems);
  };

  return (
    <div className="p-4 border-4 border-black">
      <h2 className="text-3xl font-bold mb-4 uppercase">Compartment Contents</h2>
      <div className="flex justify-between mb-4">
        <AddItemDialog onAddItem={(item) => onAddItem({ ...item, id: Date.now(), position: { x: 0, y: 0 }, size: { width: 100, height: 100 } })} />
        <Button onClick={onDeleteCompartment} className="bg-white border-4 border-black text-black hover:bg-red-500 hover:text-white transition-colors">
          <Trash2 size={24} className="mr-2" />
          Delete Compartment
        </Button>
      </div>
      <div className="mt-4 relative h-[500px] border-4 border-black">
        {items.map((item) => (
          <ClothingItem
            key={item.id}
            {...item}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onResize={handleResize}
            onDelete={onDeleteItem}
          />
        ))}
      </div>
    </div>
  );
};

const CompartmentPreview = ({ name, items, onClick }) => {
  // Create a Set of unique item IDs to avoid duplicates
  const uniqueItemIds = new Set(items.map(item => item.id));
  
  // Create an array of unique items
  const uniqueItems = Array.from(uniqueItemIds).map(id => 
    items.find(item => item.id === id)
  );

  return (
    <motion.div 
      className="bg-white rounded-lg p-4 cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <h2 className="text-xl font-bold mb-2 truncate">{name}</h2>
      <div className="grid grid-cols-2 gap-2">
        {uniqueItems.slice(0, 4).map((item) => (
          <img key={item.id} src={item.image} alt={item.type} className="w-full h-24 object-cover rounded-md" />
        ))}
        {uniqueItems.length > 4 && (
          <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded-md text-gray-600 font-semibold">
            +{uniqueItems.length - 4}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProfileDialog = ({ profile, onSave, onUpdate }) => {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [password, setPassword] = useState('');

  const handleSave = () => {
    if (profile) {
      onUpdate({ ...profile, name, email, password: password || profile.password });
    } else {
      onSave({ name, email, password });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
      <Button className="bg-white border-4 border-black text-black hover:bg-yellow-200 transition-colors w-10 h-10 p-1 sm:p-1 md:p-2 lg:p-1">
      <User size={24} />
      </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-4 border-black p-2">
        <DialogHeader className="bg-black text-white p-4">
          <DialogTitle className="text-2xl font-bold uppercase">{profile ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="border-4 border-black" />
          <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border-4 border-black" />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-4 border-black" />
          <Button onClick={handleSave} className="w-full bg-black text-white hover:bg-gray-800">{profile ? 'Update' : 'Save'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClothingOrganizerApp = () => {
  const [compartments, setCompartments] = useState([]);
  const [activeCompartment, setActiveCompartment] = useState(null);
  const [newCompartmentName, setNewCompartmentName] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem('profile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      const savedCompartments = localStorage.getItem(`compartments_${parsedProfile.email}`);
      if (savedCompartments) {
        setCompartments(JSON.parse(savedCompartments));
      } else {
        // Create default compartment if no compartments exist
        setCompartments([{
          name: "Example",
          items: [
            {
              id: 1,
              type: "shirt",
              image: `/assets/white-shirt.png`,        
              position: { x: 126, y: 60 },
              size: { width: 100, height: 100 }
            },
            {
              id: 2,
              type: "pants",
              image: `/assets/black-pants.png`,        
              position: { x: 127, y: 170 },
              size: { width: 100, height: 100 }
            }
          ]
        }]);
      }
    } else {
      // If no profile exists, still create the default compartment
      setCompartments([{
        name: "Example",
        items: [
          {
            id: 1,
            type: "shirt",
            image: `/assets/white-shirt.png`,
           
            position: { x: 126, y: 60 },
            size: { width: 100, height: 100 }
          },
          {
            id: 2,
            type: "pants",
            image: `/assets/black-pants.png`,        
            position: { x: 127, y: 170 },
            size: { width: 100, height: 100 }
          }
        ]
      }]);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(`compartments_${profile.email}`, JSON.stringify(compartments));
    }
  }, [compartments, profile]);

  const addCompartment = () => {
    if (newCompartmentName.trim()) {
      setCompartments(prev => [...prev, { name: newCompartmentName, items: [] }]);
      setNewCompartmentName('');
    }
  };

  const handleAddItem = (item) => {
    setCompartments(prevCompartments => {
      const newCompartments = [...prevCompartments];
      newCompartments[activeCompartment].items.push(item);
      return newCompartments;
    });
  };

  const handleUpdateItems = (updatedItems) => {
    setCompartments(prevCompartments => {
      const newCompartments = [...prevCompartments];
      newCompartments[activeCompartment].items = updatedItems;
      return newCompartments;
    });
  };

  const handleDeleteItem = (itemId) => {
    setCompartments(prevCompartments => {
      const newCompartments = [...prevCompartments];
      newCompartments[activeCompartment].items = newCompartments[activeCompartment].items.filter(item => item.id !== itemId);
      return newCompartments;
    });
  };

  const handleDeleteCompartment = () => {
    setCompartments(prevCompartments => prevCompartments.filter((_, index) => index !== activeCompartment));
    setActiveCompartment(null);
  };

  const handleSaveProfile = (newProfile) => {
    setProfile(newProfile);
    localStorage.setItem('profile', JSON.stringify(newProfile));
  };

  const handleUpdateProfile = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-black text-white p-2 ">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold uppercase">VWARDROBEBYKOSH </h1>
          <ProfileDialog profile={profile} onSave={handleSaveProfile} onUpdate={handleUpdateProfile} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {activeCompartment !== null ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Button onClick={() => setActiveCompartment(null)} className="mb-4 flex items-center bg-white border-4 border-black text-black hover:bg-yellow-200 transition-colors">
              <ChevronLeft size={24} className="mr-2" />
              Back to Compartments
            </Button>
            <CompartmentContent 
              items={compartments[activeCompartment].items}
              onAddItem={handleAddItem}
              onUpdateItems={handleUpdateItems}
              onDeleteItem={handleDeleteItem}
              onDeleteCompartment={handleDeleteCompartment}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-col sm:flex-row items-stretch mb-4">
              <Input
                type="text"
                placeholder="New Compartment Name"
                value={newCompartmentName}
                onChange={(e) => setNewCompartmentName(e.target.value)}
                className="flex-grow mb-2 sm:mb-0 sm:mr-2 border-4 border-black focus:ring-0 focus:border-black"
              />
              <Button onClick={addCompartment} className="bg-black text-white hover:bg-gray-800">
                <Plus size={24} className="mr-2" />
                Add 
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {compartments.map((compartment, index) => (
                <CompartmentPreview
                  key={index}
                  name={compartment.name}
                  items={compartment.items}
                  onClick={() => setActiveCompartment(index)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ClothingOrganizerApp;