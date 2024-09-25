import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Plus, X, Save, User } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ClothingItem = ({ id, type, image, position, size, onDragStart, onDrag, onDragEnd, onResize, onDelete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0 });

  const handleMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      onDragStart();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      onDrag(id, { x: newX, y: newY });
    }
    if (isResizing) {
      const newWidth = resizeStart.current.width + (e.clientX - resizeStart.current.x);
      const newHeight = resizeStart.current.height + (e.clientY - resizeStart.current.y);
      onResize(id, { width: Math.max(50, newWidth), height: Math.max(50, newHeight) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    onDragEnd();
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = { 
      width: size.width, 
      height: size.height,
      x: e.clientX,
      y: e.clientY
    };
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowDeleteButton(true)}
      onMouseLeave={() => setShowDeleteButton(false)}
    >
      <img src={image} alt={type} className="w-full h-full object-contain pointer-events-none" />
      <div
        className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 cursor-se-resize"
        onMouseDown={handleResizeStart}
      />
      {showDeleteButton && (
        <button
          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
          onClick={() => onDelete(id)}
        >
          <X size={16} />
        </button>
      )}
    </div>
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
          <Button>
            <Plus size={24} />
            Add Item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            {!image ? (
              <>
                <Button onClick={handleCapture}>
                  <Camera size={24} />
                  Capture Image
                </Button>
                <label className="cursor-pointer">
                  <Input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                  <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Upload size={24} />
                    <span className="ml-2">Upload Image</span>
                  </div>
                </label>
              </>
            ) : (
              <>
                <img src={image} alt="Selected item" className="w-32 h-32 object-contain mx-auto" />
                <select
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select item type</option>
                  <option value="shirt">Shirt</option>
                  <option value="pants">Pants</option>
                  <option value="shoes">Shoes</option>
                </select>
                <Button onClick={handleAddItem} disabled={!itemType}>Add Item</Button>
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
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Compartment Contents</h2>
        <div className="flex justify-between mb-4">
          <AddItemDialog onAddItem={(item) => onAddItem({ ...item, id: Date.now(), position: { x: 0, y: 0 }, size: { width: 100, height: 100 } })} />
          <Button onClick={onDeleteCompartment} variant="destructive">Delete Compartment</Button>
        </div>
        <div className="mt-4 relative h-[500px] border border-gray-300">
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
    return (
      <div 
        className="border border-gray-300 rounded-lg p-4 m-2 w-64 h-96 relative cursor-pointer"
        onClick={onClick}
      >
        <h2 className="text-xl font-bold mb-2">{name}</h2>
        <div className="flex flex-wrap">
          {items.slice(0, 4).map((item, index) => (
            <img key={item.id} src={item.image} alt={item.type} className="w-16 h-16 object-contain m-1" />
          ))}
          {items.length > 4 && <div className="w-16 h-16 bg-gray-200 flex items-center justify-center m-1">+{items.length - 4}</div>}
        </div>
      </div>
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
          <Button variant="outline"><User size={24} /></Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{profile ? 'Edit Profile' : 'Create Profile'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <Button onClick={handleSave}>{profile ? 'Update' : 'Save'}</Button>
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
        }
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
  
    if (activeCompartment !== null) {
      return (
        <div>
          <Button onClick={() => setActiveCompartment(null)} className="mb-4">
            Back to Compartments
          </Button>
          <CompartmentContent 
            items={compartments[activeCompartment].items}
            onAddItem={handleAddItem}
            onUpdateItems={handleUpdateItems}
            onDeleteItem={handleDeleteItem}
            onDeleteCompartment={handleDeleteCompartment}
          />
        </div>
      );
    }
  
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Clothing Organizer</h1>
          <ProfileDialog profile={profile} onSave={handleSaveProfile} onUpdate={handleUpdateProfile} />
        </div>
        <div className="flex items-center mb-4">
          <Input
            type="text"
            placeholder="New Compartment Name"
            value={newCompartmentName}
            onChange={(e) => setNewCompartmentName(e.target.value)}
            className="mr-2"
          />
          <Button onClick={addCompartment}>
            <Plus size={24} />
            Add Compartment
          </Button>
        </div>
        <div className="flex flex-wrap">
          {compartments.map((compartment, index) => (
            <CompartmentPreview
              key={index}
              name={compartment.name}
              items={compartment.items}
              onClick={() => setActiveCompartment(index)}
            />
          ))}
        </div>
      </div>
    );
  };
  
  export default ClothingOrganizerApp;