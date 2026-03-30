import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Save, X, FileCode, Layout, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Template {
  id: number;
  name: string;
  prompt_template: string;
  flow_structure: string;
  created_at: string;
}

export default function TemplatesPage() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({
    name: '',
    prompt_template: '',
    flow_structure: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentTemplate.name || !currentTemplate.prompt_template || !currentTemplate.flow_structure) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    try {
      const method = currentTemplate.id ? 'PUT' : 'POST';
      const url = currentTemplate.id ? `/api/templates/${currentTemplate.id}` : '/api/templates';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(currentTemplate)
      });

      if (res.ok) {
        setIsEditing(false);
        setCurrentTemplate({ name: '', prompt_template: '', flow_structure: '' });
        fetchTemplates();
      } else {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar template');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (err) {
      console.error('Error deleting template:', err);
    }
  };

  const openEdit = (template?: Template) => {
    if (template) {
      setCurrentTemplate(template);
    } else {
      setCurrentTemplate({ name: '', prompt_template: '', flow_structure: '' });
    }
    setIsEditing(true);
    setError('');
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 sm:text-3xl">Templates de Fluxo</h2>
          <p className="mt-1 text-sm text-zinc-500">Gerencie os modelos de prompt e estrutura de fluxo para seus sites.</p>
        </div>
        <button
          onClick={() => openEdit()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <motion.div
              layout
              key={template.id}
              className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Layout className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(template)}
                      className="p-1 text-zinc-400 hover:text-emerald-600 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="p-1 text-zinc-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{template.name}</h3>
                <p className="text-xs text-zinc-500 mb-4">Criado em: {new Date(template.created_at).toLocaleDateString()}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-xs text-zinc-600">
                    <Sparkles className="w-3 h-3 mr-1 text-amber-500" />
                    Prompt configurado
                  </div>
                  <div className="flex items-center text-xs text-zinc-600">
                    <FileCode className="w-3 h-3 mr-1 text-blue-500" />
                    Estrutura de fluxo definida
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50">
                <h3 className="text-xl font-bold text-zinc-900">
                  {currentTemplate.id ? 'Editar Template' : 'Novo Template'}
                </h3>
                <button onClick={() => setIsEditing(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Template</label>
                  <input
                    type="text"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, name: e.target.value })}
                    placeholder="Ex: Restaurante Rústico Premium"
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Prompt Template (Use {'${data.name}'}, {'${data.address}'}, {'${data.city}'}, {'${data.phone}'}, {'${data.description}'}, {'${data.services}'}, {'${mapLink}'})
                  </label>
                  <textarea
                    value={currentTemplate.prompt_template}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, prompt_template: e.target.value })}
                    rows={10}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                    placeholder="Aja como um Arquiteto Front-end..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Estrutura do Fluxo (JSON) - Use {'{{prompt}}'} e {'{{siteName}}'}
                  </label>
                  <textarea
                    value={currentTemplate.flow_structure}
                    onChange={(e) => setCurrentTemplate({ ...currentTemplate, flow_structure: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                    placeholder='{ "nodes": [...], "edges": [...] }'
                  />
                </div>
              </div>

              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  <Save className="w-4 h-4 mr-2" /> Salvar Template
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
