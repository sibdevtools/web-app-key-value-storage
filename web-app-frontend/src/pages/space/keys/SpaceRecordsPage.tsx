import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap';
import { ArrowLeft01Icon, Delete01Icon, PencilEdit01Icon, PlusSignIcon } from 'hugeicons-react';
import { contextPath } from '../../../const/common.const';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteKey, getKeys, getValue, setValue, ValueHolder } from '../../../api/api';
import { CustomTable, Loader } from '@sibdevtools/frontend-common';
import { CustomTableParts } from '@sibdevtools/frontend-common/dist/components/custom-table/types';
import { getViewRepresentation, ViewType } from '../../../utils/view';
import { RecordCreateModal } from './RecordCreateModal';
import { RecordUpdateModal } from './RecordUpdateModal';

interface CachedValue {
  data?: ValueHolder;
  viewType: ViewType;
  loading: boolean;
  error?: string;
}

export interface SpaceRecord {
  key: string;
  value: string;
  expiredAt: number | undefined;
}

const SpaceRecordsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [minorError, setMinorError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SpaceRecord | null>(null);
  const navigate = useNavigate();
  const { space } = useParams();

  const [valuesCache, setValuesCache] = useState<Record<string, CachedValue>>({});

  if (!space) {
    navigate(contextPath);
    return;
  }

  const ExpandableRowContent: React.FC<{ keyName: string }> = ({ keyName }) => {
    const cacheItem = valuesCache[keyName] || { loading: false };
    const { data, loading, error } = cacheItem;

    useEffect(() => {
      if (!data && !loading && !error) {
        loadKeyValue(keyName);
      }
    }, [keyName, data, loading, error]);

    if (loading) {
      return <Loader loading={true} />;
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    const toLocalDate = (amount: number | undefined | null): string => {
      if (!amount) {
        return '-';
      }
      const d = new Date(amount);
      return d.toISOString();
    };

    return (
      <Container>
        <Row>
          <Col xs={4}>
            <Row>
              <Col xs={4}>Created At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.createdAt)}</Col>
            </Row>
            <Row>
              <Col xs={4}>Modified At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.modifiedAt)}</Col>
            </Row>
            <Row>
              <Col xs={4}>Expired At</Col>
              <Col xs={8}>{toLocalDate(data?.meta.expiredAt)}</Col>
            </Row>
          </Col>
          <Col xs={8}>
            <Row className={'mb-4'}>
              <Col xs={4}>
                Value View Type
              </Col>
              <Col xs={6}>
                <Form.Select
                  value={cacheItem.viewType}
                  onChange={(e) => setValuesCache(prev => ({
                    ...prev,
                    [keyName]: {
                      ...prev[keyName],
                      viewType: e.target.value as ViewType,
                    } as CachedValue,
                  }))}
                  required={true}
                >
                  <option value={'base64'}>Base64</option>
                  <option value={'raw'}>Raw</option>
                </Form.Select>
              </Col>
            </Row>
            <Row>
            <textarea
              id={`value-${keyName}`}
              className={'form-control'}
              readOnly={true}
              value={getViewRepresentation(cacheItem.viewType, data?.value || '')}
            />
            </Row>
          </Col>
        </Row>
      </Container>
    );
  };

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getKeys(space);
      if (response.data.success) {
        setKeys(response.data.body);
      } else {
        setError('Failed to fetch keys');
      }
    } catch (error) {
      console.error('Failed to fetch keys:', error);
      setError('Failed to fetch keys');
    } finally {
      setLoading(false);
    }
  }, [space]);

  const loadKeyValue = useCallback(async (key: string) => {
    if (valuesCache[key]) {
      return valuesCache[key];
    }
    setValuesCache(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        loading: true,
        error: undefined
      }
    }));

    try {
      const response = await getValue(space, key);
      if (response.data.success) {
        if (!response.data.body) {
          setKeys(prev => prev.filter(k => k !== key));
          return undefined;
        }
        const cacheItem = {
          data: response.data.body,
          viewType: 'base64',
          loading: false
        } as CachedValue;
        setValuesCache(prev => ({
          ...prev,
          [key]: cacheItem
        }));
        return cacheItem;
      }
      const cacheItem = {
        viewType: 'base64',
        loading: false,
        error: 'Failed to fetch value'
      } as CachedValue;
      setValuesCache(prev => ({
        ...prev,
        [key]: cacheItem
      }));
    } catch (err) {
      console.error(`Failed to fetch value for key ${key}:`, err);
      const cacheItem = {
        viewType: 'base64',
        loading: false,
        error: 'Failed to fetch value'
      } as CachedValue;
      setValuesCache(prev => ({
        ...prev,
        [key]: cacheItem
      }));
      return cacheItem;
    }
  }, [space]);

  const doShowEditModal = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, key: string) => {
    e.preventDefault();
    e.stopPropagation();
    let cacheItem = valuesCache[key];
    if (!cacheItem || cacheItem.loading || cacheItem.error) {
      const rs = await loadKeyValue(key);
      if (!rs || rs.error) return;
      cacheItem = rs;
    }
    setEditingRecord({
      key: key,
      value: cacheItem.data?.value || '',
      expiredAt: cacheItem.data?.meta.expiredAt,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (key: string) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await deleteKey(space, key);
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to delete key');
        return;
      }

      setKeys(prev => prev.filter(k => k !== key));
      setValuesCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error('Failed to delete key:', error);
      setMinorError('Failed to delete key');
    }
  };

  useEffect(() => {
    if (space) {
      setValuesCache({});
      fetchKeys();
    }
  }, [space, fetchKeys]);

  const handleAddClick = () => {
    setShowCreateModal(true);
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
          <Button
            variant={'outline-primary'}
            onClick={() => navigate(contextPath)}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={6}>
          <span className={'h2'}>Space <code>{space}</code> keys</span>
        </Col>
        <Col md={{ span: 1, offset: 1 }}>
          <ButtonGroup>
            <Button
              variant="outline-success"
              onClick={handleAddClick}
              title={'Add'}
            >
              <PlusSignIcon />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row className="mt-4">
        <Col md={{ span: 10, offset: 1 }}>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {minorError && (
            <Alert variant="danger" onClose={() => setMinorError(null)} dismissible>
              {minorError}
            </Alert>
          )}
          {!error && (
            <CustomTable
              table={{ responsive: true, striped: true }}
              thead={{
                columns: {
                  key: {
                    label: 'Key',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                  actions: {
                    label: 'Actions',
                    className: 'text-center'
                  }
                },
              }}
              tbody={{
                data: keys.map(key => ({
                  key: {
                    representation: <code>{key}</code>,
                    value: key,
                    className: 'text-center'
                  },
                  actions: {
                    representation: (
                      <ButtonGroup>
                        <Button
                          variant={'outline-primary'}
                          onClick={(e) => doShowEditModal(e, key)}
                          title={'Change'}
                        >
                          <PencilEdit01Icon />
                        </Button>
                        <Button
                          variant={'danger'}
                          onClick={() => handleDelete(key)}
                          title={'Delete'}
                        >
                          <Delete01Icon />
                        </Button>
                      </ButtonGroup>
                    ),
                    className: 'text-center'
                  }
                })),
                rowBehavior: {
                  expandableContent: (row: CustomTableParts.Row) => {
                    const key = (row.key as CustomTableParts.ReactCell).value as string;
                    return key ? <ExpandableRowContent keyName={key} /> : null;
                  }
                },
                pagination: {
                  pageSize: 50,
                  buttons: {
                    size: 'sm'
                  }
                }
              }}
              loading={loading}
            />
          )}
        </Col>
      </Row>

      {showCreateModal && (
        <RecordCreateModal
          showModal={showCreateModal}
          setShowModal={setShowCreateModal}
          handleSave={async (key: string, value: string, expiredAt: number | undefined) => {
            try {
              const response = await setValue({
                space,
                key,
                value,
                expiredAt,
              });
              if (response.status !== 200 || !response.data.success) {
                setMinorError(`Failed to create key: ${key}`);
                return;
              }

              setKeys(prev => [...prev, key]);
              setValuesCache(prev => {
                const { [key]: _, ...rest } = prev;
                return rest;
              });
            } catch (error) {
              console.error(`Failed to create key: ${key}`, error);
              setMinorError(`Failed to create key: ${key}`);
            } finally {
              setShowCreateModal(false);
            }
          }}
        />
      )}

      {showEditModal && editingRecord && (
        <RecordUpdateModal
          showModal={showEditModal}
          setShowModal={setShowEditModal}
          spaceRecord={editingRecord}
          handleSave={async (key: string, value: string, expiredAt: number | undefined) => {
            try {
              const response = await setValue({
                space,
                key,
                value,
                expiredAt,
              });
              if (response.status !== 200 || !response.data.success) {
                setMinorError(`Failed to update key: ${key}`);
                return;
              }

              setValuesCache(prev => {
                const { [key]: _, ...rest } = prev;
                return rest;
              });
            } catch (error) {
              console.error(`Failed to update key: ${key}`, error);
              setMinorError(`Failed to update key: ${key}`);
            } finally {
              setShowEditModal(false);
            }
          }}
        />
      )}
    </Container>
  );
};

export default SpaceRecordsPage;
