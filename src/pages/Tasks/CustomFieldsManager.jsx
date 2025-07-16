import React, { useState, useEffect } from 'react';
import { customFieldsAPI } from '../../services/api';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  User,
  DollarSign,
  List,
  AlertCircle,
  Loader
} from 'lucide-react';

const CustomFieldsManager = ({ onFieldsChange }) => {
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const [fieldForm, setFieldForm] = useState({
    name: '',
    field_type: 'text',
    description: '',
    required: false,
    options: { values: [] }
  });

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: Type },
    { value: 'long_text', label: 'Long Text', icon: Type },
    { value: 'number', label: 'Number', icon: Hash },
    { value: 'currency', label: 'Currency', icon: DollarSign },
    { value: 'date', label: 'Date', icon: Calendar },
    { value: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { value: 'dropdown', label: 'Dropdown', icon: List },
    { value: 'user', label: 'User', icon: User }
  ];

  useEffect(() => {
    loadCustomFields();
  }, []);

  const loadCustomFields = async () => {
    try {
      setLoading(true);
      const response = await customFieldsAPI.getAll();
      setCustomFields(response.custom_fields || []);
    } catch (error) {
      console.error('Failed to load custom fields:', error);
      setError('Failed to load custom fields');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateField = async () => {
    try {
      await customFieldsAPI.create(fieldForm);
      await loadCustomFields();
      onFieldsChange?.();
      setFieldForm({
        name: '',
        field_type: 'text',
        description: '',
        required: false,
        options: { values: [] }
      });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create custom field:', error);
      alert('Failed to create custom field');
    }
  };

  const handleUpdateField = async () => {
    try {
      await customFieldsAPI.update(editingField.id, fieldForm);
      await loadCustomFields();
      onFieldsChange?.();
      setEditingField(null);
      setFieldForm({
        name: '',
        field_type: 'text',
        description: '',
        required: false,
        options: { values: [] }
      });
    } catch (error) {
      console.error('Failed to update custom field:', error);
      alert('Failed to update custom field');
    }
  };

  const handleDeleteField = async (fieldId) => {
    if (!confirm('Are you sure you want to delete this custom field? This action cannot be undone.')) {
      return;
    }

    try {
      await customFieldsAPI.delete(fieldId);
      await loadCustomFields();
      onFieldsChange?.();
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      alert('Failed to delete custom field');
    }
  };

  const startEdit = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      field_type: field.field_type,
      description: field.description || '',
      required: field.required || false,
      options: field.options || { values: [] }
    });
  };

  const addDropdownOption = () => {
    setFieldForm(prev => ({
      ...prev,
      options: {
        ...prev.options,
        values: [...(prev.options.values || []), '']
      }
    }));
  };

  const updateDropdownOption = (index, value) => {
    setFieldForm(prev => ({
      ...prev,
      options: {
        ...prev.options,
        values: prev.options.values.map((option, i) => i === index ? value : option)
      }
    }));
  };

  const removeDropdownOption = (index) => {
    setFieldForm(prev => ({
      ...prev,
      options: {
        ...prev.options,
        values: prev.options.values.filter((_, i) => i !== index)
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading custom fields...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Custom Fields</h3>
          <p className="text-sm text-gray-600">Add custom fields to capture additional task information</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Field</span>
        </button>
      </div>

      {/* Custom Fields List */}
      {customFields.length > 0 ? (
        <div className="space-y-4">
          {customFields.map(field => {
            const fieldType = fieldTypes.find(type => type.value === field.field_type);
            const IconComponent = fieldType?.icon || Type;

            return (
              <div key={field.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <IconComponent className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {fieldType?.label || field.field_type}
                        {field.description && ` • ${field.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(field)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteField(field.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No custom fields</h3>
          <p className="text-gray-600 mb-4">Add your first custom field to get started</p>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingField) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingField ? 'Edit Custom Field' : 'Create Custom Field'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingField(null);
                  setFieldForm({
                    name: '',
                    field_type: 'text',
                    description: '',
                    required: false,
                    options: { values: [] }
                  });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Field Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fieldForm.name}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Project Budget, Client Contact"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Field Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Field Type</label>
                <select
                  value={fieldForm.field_type}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, field_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={fieldForm.description}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description or instructions"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Required Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={fieldForm.required}
                  onChange={(e) => setFieldForm(prev => ({ ...prev, required: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <label className="text-sm text-gray-700">Required field</label>
              </div>

              {/* Dropdown Options */}
              {fieldForm.field_type === 'dropdown' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                  <div className="space-y-2">
                    {fieldForm.options.values.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateDropdownOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => removeDropdownOption(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addDropdownOption}
                      className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700"
                    >
                      <Plus className="h-4 w-4 mx-auto" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingField(null);
                  setFieldForm({
                    name: '',
                    field_type: 'text',
                    description: '',
                    required: false,
                    options: { values: [] }
                  });
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={editingField ? handleUpdateField : handleCreateField}
                disabled={!fieldForm.name.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingField ? 'Update Field' : 'Create Field'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFieldsManager;